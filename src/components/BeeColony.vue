  <style>
         body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #fff5d4;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0d9a0;
        }
        .dashboard {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }
        .panel {
            background-color: #fff5d4;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            height: 100%; 
            box-sizing: border-box; 
            display: flex;
            flex-direction: column; 
        } 
        .hive-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .hive {
            background-color: #e8c070;
            padding: 20px;
            border-radius: 10px;
            min-height: 600px;
            position: relative;
        }
        .field {
            background-color: #d4edda;
            border-radius: 10px;
            min-height: 600px;
            position: relative;
            overflow: hidden;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin-bottom: 15px;
        } 
        .stat-item {
        background-color: #fff;
        padding: 10px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 3px rgba(0,0,0,0.1);
        min-width: 0; 
        }
        .controls {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
        }
        button {
            background-color: #4a7c59;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #3a6348;
        }
        button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .log {
            max-height: 200px;
            overflow-y: auto;
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 14px;
        }
        .log-entry {
            margin-bottom: 5px;
            padding-bottom: 5px;
            border-bottom: 1px dotted #ddd;
        }
        
        /* Элементы симуляции */
       
            .flower {
            position: absolute;
            width: 20px;
            height: 20px;
            background-color: #e83e8c; /* Фиксированный цвет для всех цветков */
            border-radius: 50% 50% 0 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: white;
            font-weight: bold;
            text-shadow: 0 0 2px black;
        }
        .flower::after {
            content: '';
            position: absolute;
            width: 4px;
            height: 15px;
            background-color: #28a745;
            bottom: -15px;
            left: 8px;
        }

        .lake {
            position: absolute;
            width: 300px;
            height: 150px;
            background-color: #4da6ff;
            border-radius: 50%;
            bottom: 50px;
            right: 50px;
            z-index: 1;
            opacity: 0.7;
        }
    </style>

<template>
    <div class="container">
        <div class="header">
            <h1>Симуляция пчелиной колонии</h1>
            <p>День: {{ day }} | Время дня: {{ timeOfDay }} | Время года: {{ season }}</p>
        </div>
        
            <div class="dashboard">
                <div class="panel">
                    <h2 align="center">Состав колонии</h2>
                    <div class="stats">
                        <div class="stat-item">
                            <div>Матка</div>
                            <div>{{ queenCount }}</div>
                        </div>
                        <div class="stat-item">
                            <div>Рабочие</div>
                            <div>{{ workerCount }}</div>
                        </div>
                        <div class="stat-item">
                            <div>Трутни</div>
                            <div>{{ droneCount }}</div>
                        </div>
                         <div class="stat-item">
                            <div>Куколки</div>
                            <div>{{ pupaCount }}</div>
                        </div>
                        <div class="stat-item">
                            <div>Личинки</div>
                            <div>{{ larvaCount }}</div>
                        </div>
                          <div class="stat-item">
                            <div>Яйца</div>
                            <div>{{ eggCount }}</div>
                        </div>
                    </div>

                      <h2 align="center">Распределение задач</h2>
                    <div class="stats">
                        <div class="stat-item">
                            <div>Уборщицы</div>
                            <div>{{ cleanerCount }}</div>
                        </div>
                        <div class="stat-item">
                            <div>Кормилицы</div>
                            <div>{{ nurseCount }} </div>
                        </div>
                        <div class="stat-item">
                            <div>Строители</div>
                            <div>{{ builderCount }}</div>
                        </div>
                        <div class="stat-item">
                            <div>Приёмщицы</div>
                            <div>{{ receptionistsCount }}</div>
                        </div>
                         <div class="stat-item">
                            <div>Охранники</div>
                            <div>{{ guardsCount }}</div>
                        </div>
                         <div class="stat-item">
                            <div>Сборщики</div>
                            <div>{{ foragersCount }}</div>
                        </div>
                    </div>
                
                <SimulationControls 
                    @start="startSimulation"
                    @pause="pauseSimulation"
                    @reset="resetSimulation"
                    @change-speed="changeSpeed"
                    @add-flower="addFlower"
                    @add-worker="addWorker"
                    :isRunning="isRunning"
                />
            </div>

             <div class="panel">
    <ResourcesPanel 
      :honey="honey"
      :nectar="nectar"
      :pollen="pollen"
      :water="water"
    />
    </div>

            <div class="panel">
                <EventLog :logEntries="logEntries" />
            </div>
        </div>

        <div class="hive-container">
            <div class="hive">
                <h2 align="center">Улей</h2>
            </div>
            
            <div class="field">
                <h2 align="center">Окрестности улья</h2>
                <div class="lake"></div>
                <div 
                    v-for="(flower, index) in flowers" 
                    :key="'flower-'+index"
                    class="flower"
                    :style="{
                        left: flower.x + 'px',
                        top: flower.y + 'px',
                    }"
                    :title="'Нектар: ' + flower.nectar + ', Пыльца: ' + flower.pollen"
                ></div>
            </div>
        </div>
    </div>
</template>

<script>
import SimulationControls from './SimulationControls.vue'
import EventLog from './EventLog.vue'
import ResourcesPanel from './Resources.vue'
import style from '../styles/main.css'

export default {
    components: {
        SimulationControls,
        EventLog,
        ResourcesPanel
    },
    data() {
        return {
              day : ref(0),
                 timeOfDay : ref('утро'),
                 sеason : ref('весна'),
                 isRunning : ref(false),
                 simulationSpeed : ref(1),
                
                // Пчелиная колония
                 queenCount : ref(1),
                 workerCount : ref(50),
                 droneCount : ref(10),
                 pupaCount : ref(20),
                 larvaCount : ref(30),
                 eggCount : ref(40),
                
                // Распределение задач
                 cleanerCount : ref(5),
                 nurseCount : ref(10),
                 builderCount : ref(5),
                 receptionistsCount : ref(5),
                 guardsCount : ref(5),
                 foragersCount : ref(20),
                
                // Ресурсы
                 honey : ref(100),
                 nectar : ref(50),
                 pollen : ref(50),
                 water : ref(30),
                
                // Журнал событий
                 logEntries : ref([]),
                
                // Цветы на поляне
                 flowers : ref([]),
        }
    },
    methods: {
        // Инициализация цветов
                 initFlowers () {
                     newFlowers = [];
                     fieldWidth = 550; // Примерная ширина поля
                     fieldHeight = 350; // Примерная высота поля
                    
                    // Создаем 20 случайных цветов
                    for (let i = 0; i < 20; i++) {
                        newFlowers.push({
                            x: Math.random() * (fieldWidth) + 20,
                            y: Math.random() * (fieldHeight) + 40,
                            nectar: Math.floor(Math.random() * 10) + 1,
                            pollen: Math.floor(Math.random() * 10) + 1
                        });
                    }
                    
                    flowers.value = newFlowers;
                },
                
            
                // Добавление нового цветка
                 addFlower () {
                     fieldWidth = 500;
                     fieldHeight = 350;
                    
                    flowers.value.push({
                        x: Math.random() * (fieldWidth) + 20,
                        y: Math.random() * (fieldHeight) + 40,
                        nectar: Math.floor(Math.random() * 10) + 1,
                        pollen: Math.floor(Math.random() * 10) + 1
                    });
                    
                    logEntries.value.unshift({
                        day: day.value,
                        message: 'На поляне вырос новый цветок!'
                    });
                },
                
                // Управление симуляцией
                 startSimulation () {
                    isRunning.value = true;
                    logEntries.value.unshift({
                        day: day.value,
                        message: 'Симуляция начата'
                    });
                },
                
                 pauseSimulation () {
                    isRunning.value = false;
                    logEntries.value.unshift({
                        day: day.value,
                        message: 'Симуляция на паузе'
                    });
                },
                
                 resetSimulation () {
                    isRunning.value = false;
                    day.value = 0;
                    timeOfDay.value = 'утро';
                    sеason.value = 'весна';
                    logEntries.value = [];
                    initFlowers();
                    logEntries.value.unshift({
                        day: day.value,
                        message: 'Симуляция сброшена'
                    });
                },
                
                 changeSpeed (speed) {
                    simulationSpeed.value = speed;
                    logEntries.value.unshift({
                        day: day.value,
                        message: 'Скорость симуляции изменена на ' + speed + 'x'
                    });
                },
                
                 addWorker () {
                    workerCount.value++;
                    logEntries.value.unshift({
                        day: day.value,
                        message: 'Добавлена новая рабочая пчела'
                    });
                }
    },
    mounted() {
        this.initFlowers()
    }
}
</script>

