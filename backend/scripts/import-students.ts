/**
 * Script per importare studenti da CSV
 * 
 * Uso: npx ts-node scripts/import-students.ts
 * oppure: npx tsx scripts/import-students.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CsvRow {
    Cognome: string;
    Name: string;
    Email: string;
    Email1: string;
    Phone: string;
    Phone1: string;
    Company: string;
    Address: string;
}

function parseAddress(address: string): { indirizzo: string | null; citta: string | null; cap: string | null } {
    if (!address || address.trim() === '') {
        return { indirizzo: null, citta: null, cap: null };
    }

    // Formato: "via xxx, città, provincia, Italy - CAP"
    // Es: "piazza aurelio nicolodi 2, trapani, trapani, Italy - 91100"
    const parts = address.split(',').map(p => p.trim());

    let indirizzo: string | null = null;
    let citta: string | null = null;
    let cap: string | null = null;

    if (parts.length >= 1) {
        indirizzo = parts[0] || null;
    }

    if (parts.length >= 2) {
        citta = parts[1] || null;
    }

    // Estrai CAP dal formato "Italy - 91100"
    const capMatch = address.match(/- (\d{5})$/);
    if (capMatch) {
        cap = capMatch[1];
    }

    return { indirizzo, citta, cap };
}

function formatPhone(phone: string): string | null {
    if (!phone || phone.trim() === '') {
        return null;
    }

    // Rimuovi eventuali spazi e formatta con +39
    let cleaned = phone.replace(/\s/g, '');

    // Se inizia con 39, aggiungi +
    if (cleaned.startsWith('39') && !cleaned.startsWith('+39')) {
        cleaned = '+' + cleaned;
    }

    // Se non ha prefisso, aggiungi +39
    if (!cleaned.startsWith('+')) {
        cleaned = '+39' + cleaned;
    }

    return cleaned;
}

function parseCsv(content: string): CsvRow[] {
    const lines = content.split('\n');
    const headers = lines[0].replace('\r', '').split(';');

    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].replace('\r', '');
        if (!line || line.trim() === '' || line === ';;;;;;;') {
            continue; // Salta righe vuote
        }

        const values = line.split(';');

        // Verifica che ci sia almeno cognome o nome
        if (!values[0]?.trim() && !values[1]?.trim()) {
            continue;
        }

        const row: CsvRow = {
            Cognome: values[0] || '',
            Name: values[1] || '',
            Email: values[2] || '',
            Email1: values[3] || '',
            Phone: values[4] || '',
            Phone1: values[5] || '',
            Company: values[6] || '',
            Address: values[7] || ''
        };

        rows.push(row);
    }

    return rows;
}

async function importStudents(csvPath: string, dryRun: boolean = true) {
    console.log(`\n📂 Lettura file: ${csvPath}\n`);

    const content = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCsv(content);

    console.log(`📊 Trovati ${rows.length} studenti nel CSV\n`);

    if (rows.length === 0) {
        console.log('❌ Nessuno studente trovato nel CSV');
        return;
    }

    // Mostra anteprima
    console.log('📋 Anteprima primi 5 studenti:\n');
    console.log('-'.repeat(70));

    for (let i = 0; i < Math.min(5, rows.length); i++) {
        const row = rows[i];
        const addr = parseAddress(row.Address);
        console.log(`  ${i + 1}. ${row.Name} ${row.Cognome}`);
        console.log(`     Email: ${row.Email || '-'}`);
        console.log(`     Phone: ${formatPhone(row.Phone) || '-'}`);
        console.log(`     Indirizzo: ${addr.indirizzo || '-'}, ${addr.citta || '-'} ${addr.cap || ''}`);
        console.log('');
    }
    console.log('-'.repeat(70));

    if (dryRun) {
        console.log('\n⚠️  MODALITÀ DRY RUN - Nessuna modifica al database');
        console.log('   Per eseguire l\'import, lancia con: --execute\n');
        return;
    }

    console.log('\n🚀 Inizio import nel database...\n');

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of rows) {
        try {
            const firstName = row.Name.trim();
            const lastName = row.Cognome.trim();

            if (!firstName && !lastName) {
                skipped++;
                continue;
            }

            // Verifica se esiste già uno studente con lo stesso nome
            const existing = await prisma.student.findFirst({
                where: {
                    firstName: { equals: firstName, mode: 'insensitive' },
                    lastName: { equals: lastName, mode: 'insensitive' }
                }
            });

            if (existing) {
                console.log(`⏭️  Saltato (già esiste): ${firstName} ${lastName}`);
                skipped++;
                continue;
            }

            const addr = parseAddress(row.Address);

            await prisma.student.create({
                data: {
                    firstName: firstName || 'N/A',
                    lastName: lastName || 'N/A',
                    studentEmail: row.Email?.trim() || null,
                    studentPhone: formatPhone(row.Phone),
                    parentIndirizzo: addr.indirizzo,
                    parentCitta: addr.citta,
                    parentCap: addr.cap,
                    active: true
                }
            });

            console.log(`✅ Importato: ${firstName} ${lastName}`);
            imported++;

        } catch (error) {
            console.error(`❌ Errore per ${row.Name} ${row.Cognome}:`, error);
            errors++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RIEPILOGO IMPORT');
    console.log('='.repeat(50));
    console.log(`   ✅ Importati: ${imported}`);
    console.log(`   ⏭️  Saltati (già esistenti): ${skipped}`);
    console.log(`   ❌ Errori: ${errors}`);
    console.log('='.repeat(50) + '\n');
}

async function main() {
    const args = process.argv.slice(2);
    const execute = args.includes('--execute');

    // Percorso CSV (relativo alla root del progetto)
    const csvPath = path.resolve(__dirname, '../../ExportContacts (1).csv');

    if (!fs.existsSync(csvPath)) {
        console.error(`❌ File non trovato: ${csvPath}`);
        process.exit(1);
    }

    try {
        await importStudents(csvPath, !execute);
    } catch (error) {
        console.error('❌ Errore durante l\'import:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
