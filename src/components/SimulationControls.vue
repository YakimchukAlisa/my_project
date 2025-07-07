<template>
    <div>
        <h2 align="center">Управление</h2>
        <div class="stats">
            <button @click="$emit('start')" :disabled="isRunning">Старт</button>
            <button @click="$emit('pause')" :disabled="!isRunning">Пауза</button>
            <button @click="$emit('reset')">Сброс</button>
            <button @click="$emit('change-speed', 0.5)">0.5x</button>
            <button @click="$emit('change-speed', 1)">1x</button>
            <button @click="$emit('change-speed', 2)">2x</button>
            <button @click="$emit('add-flower')">Добавить цветок</button>
            <button @click="$emit('add-worker')">Добавить пчелу</button>
        </div>

        <h2 align="center">Начальные настройки</h2>
        <div class="settings">
            <h3>Пчелы </h3>
            <div class="setting-group">

                <label>
                    Кормилицы:
                    <input type="number" v-model.number="initialSettings.nurses" min="0">
                </label>
                <label>
                    Приёмщицы:
                    <input type="number" v-model.number="initialSettings.receptionists" min="0">
                </label>
                <label>
                    Сборщики:
                    <input type="number" v-model.number="initialSettings.foragers" min="0">
                </label>
            </div>
            <h3>Развитие </h3>
            <div class="setting-group">
                <label>
                    Яйца:
                    <input type="number" v-model.number="initialSettings.eggs" min="0">
                </label>
                <label>
                    Личинки:
                    <input type="number" v-model.number="initialSettings.larvae" min="0">
                </label>
                <label>
                    Куколки:
                    <input type="number" v-model.number="initialSettings.pupae" min="0">
                </label>
            </div>
            <h3>Ресурсы</h3>
            <div class="setting-group">

                <label>
                    Цветы:
                    <input type="number" v-model.number="initialSettings.flowers" min="0">
                </label>
                <label>
                    Нектар:
                    <input type="number" v-model.number="initialSettings.nectar" min="0">
                </label>
                <label>
                    Пыльца:
                    <input type="number" v-model.number="initialSettings.pollen" min="0">
                </label>
                <label>
                    Мёд:
                    <input type="number" v-model.number="initialSettings.honey" min="0">
                </label>
            </div>

            <button @click="applySettings" :disabled="isRunning">Применить настройки</button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        isRunning: Boolean
    },
    data() {
        return {
            initialSettings: {
                workers: 5,
                queens: 1,
                eggs: 3,
                larvae: 2,
                pupae: 1,
                flowers: 7,
                nectar: 10,
                pollen: 5,
                honey: 3
            }
        }
    },
    methods: {
        applySettings() {
            this.$emit('apply-settings', { ...this.initialSettings });
        }
    }
}
</script>

<style scoped>
.settings {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 1000px;
    margin: 0 auto;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 8px;
}

.setting-group {
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 10px;
    background: white;
    border-radius: 5px;
}

label {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

input {
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>