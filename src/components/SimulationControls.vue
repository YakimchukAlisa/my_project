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
    </div>
</template>

<script>
export default {
    props: {
        isRunning: Boolean
    }
}
</script>
