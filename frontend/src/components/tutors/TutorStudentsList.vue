<template>
  <div class="students-list">
    <!-- Filters -->
    <div class="filters-bar">
      <select v-model="filterPeriod" class="filter-select">
        <option value="all">Tutto lo storico</option>
        <option value="12">Ultimo anno</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="students-table">
        <thead>
          <tr>
            <th>Nome Alunno</th>
            <th>Lezioni</th>
            <th>Ore Totali</th>
            <th>Ultima Lezione</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id" class="student-row" @click="goToStudent(student.id)">
            <td>
              <div class="student-info">
                <div class="avatar-circle">{{ getInitials(student.nome) }}</div>
                <span class="student-name">{{ student.nome }}</span>
              </div>
            </td>
            <td>{{ student.lezioni }}</td>
            <td>{{ student.ore.toFixed(1) }}h</td>
            <td>{{ new Date(student.ultima).toLocaleDateString() }}</td>
            <td class="text-right">→</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  students: {
    type: Array,
    default: () => []
  }
});

const router = useRouter();
const filterPeriod = ref('all');

// Mock Data
// Mock Data replaced by props
// const students = ref([...]);

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function goToStudent(id) {
  router.push(`/students/${id}`);
}
</script>

<style scoped>
.students-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filters-bar {
  display: flex;
  justify-content: flex-end;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #344767;
  font-size: 14px;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th {
  background: #f6f9fc;
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  color: #8392ab;
  text-transform: uppercase;
  font-weight: 600;
}

.students-table td {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
  color: #344767;
}

.student-row {
  cursor: pointer;
  transition: background 0.2s;
}

.student-row:hover {
  background: #f8f9fa;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  background: #5e72e4;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.student-name {
  font-weight: 600;
  color: #344767;
}

.text-right { text-align: right; }
</style>
