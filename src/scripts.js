document.addEventListener('DOMContentLoaded', function() {
  fetch('data/netology.json')
    .then(response => response.json())
    .then(goals => {
      const goalsList = document.getElementById('goalsList');
      const mainProgressBar = document.getElementById('mainProgressBar');
      const mainProgressText = document.getElementById('mainProgressText');
      
      // Создаём элемент для прогресса
      const progressFill = document.createElement('div');
      progressFill.className = 'progress-fill';
      mainProgressBar.appendChild(progressFill);

      // Создаём элемент для поздравительного окна
      const congratsModal = document.getElementById('congrats');


      // Функция для обновления общего прогресса
      const updateMainProgress = () => {      
        const totalGoals = goals.length;
        const completedGoals = goals.filter(goal => goal.subtasks.filter(subtask => subtask.completed).length >= (goal.requiredCompleted ? goal.requiredCompleted :  goal.subtasks.length)).length;
        
        const progressPercent = totalGoals > 0 
          ? Math.round((completedGoals / totalGoals) * 100)
          : 0;
        
        progressFill.style.width = `${progressPercent}%`;
        mainProgressText.textContent = `${progressPercent}% выполнено (${completedGoals} из ${totalGoals} целей)`;

        // Проверяем достижение 100%
        if (progressPercent === 100 && !congratsShown) {
          showCongrats();
          congratsShown = true;
        }
      };
    
      let congratsShown = false;
      
      // Показать поздравительное окно
      const showCongrats = () => {
        congratsModal.classList.remove('hidden');
        setTimeout(() => {
          congratsModal.classList.add('show');
        }, 10);
      };
      
      // Закрыть поздравительное окно
      const closeCongrats = () => {
        congratsModal.classList.remove('show');
        setTimeout(() => {
          congratsModal.classList.add('hidden');
        }, 300);
      };
      
      // Обработчик закрытия окна
      congratsModal.querySelector('.close-congrats').addEventListener('click', closeCongrats);

      // Инициализируем прогресс
      updateMainProgress();
 
      // Отображаем цели с анимацией
      goals.forEach((goal, index) => {
        const goalSubtasks = goal.subtasks || [];
        const requiredCompleted = goal.requiredCompleted || goalSubtasks.length; // По умолчанию все
        const completedSubtasks = goalSubtasks.filter(subtask => subtask.completed).length;
        
        const goalProgressPercent = goalSubtasks.length > 0 
          ? Math.round((completedSubtasks / goalSubtasks.length) * 100)
          : 0;
        
        // Проверяем выполнение цели
        goal.completed = completedSubtasks >= requiredCompleted;
        
       // Создаем элемент метки, если она указана
       const labelElement = goal.label 
       ? `<span class="goal-label label-${goal.label.type}">${goal.label.text}</span>`
       : '';

        const goalItem = document.createElement('div');
        goalItem.className = `goal-item ${goal.completed ? 'completed' : ''}`;
        goalItem.innerHTML = `
          <div class="goal-header">
            <div class="goal-title">
              ${goal.title}
              ${labelElement}
            </div>
            <div class="goal-progress">
             ${completedSubtasks} из ${requiredCompleted} (${goalSubtasks.length}) подзадач
            </div>
          </div>
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width: ${goalProgressPercent}%"></div>
          </div>
          <div class="subtasks" id="subtasks-${goal.id}"></div>
        `;
        
        goalsList.appendChild(goalItem);
        
        // Добавляем подзадачи
        const subtasksContainer = goalItem.querySelector(`#subtasks-${goal.id}`);
        goalSubtasks.forEach((subtask, subIndex) => {
          const subtaskItem = document.createElement('div');
          subtaskItem.className = `subtask ${subtask.completed ? 'completed' : ''}`;
          subtaskItem.innerHTML = `
            <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
            <span class="subtask-label">${subtask.title}</span>
          `;
          
          subtasksContainer.appendChild(subtaskItem);
          
          // Обработчик изменения статуса подзадачи
          const checkbox = subtaskItem.querySelector('.subtask-checkbox');
          checkbox.addEventListener('change', function() {
            subtask.completed = this.checked;
            subtaskItem.classList.toggle('completed', subtask.completed);
            
            // Обновляем счётчик выполненных подзадач
            const newCompleted = goalSubtasks.filter(t => t.completed).length;
            const newPercent = Math.round((newCompleted / goalSubtasks.length) * 100);
            
            // Проверяем выполнение цели
            const isGoalCompleted = newCompleted >= requiredCompleted;
            
            // Обновляем отображение
            goalItem.querySelector('.goal-progress').textContent = 
              `${newCompleted} из ${requiredCompleted} (${goalSubtasks.length}) подзадач`;
            goalItem.querySelector('.goal-progress-fill').style.width = `${newPercent}%`;
            
            // Обновляем общий прогресс
            updateMainProgress();
          });
        });
        
        // Добавляем обработчик сворачивания/разворачивания
        const goalHeader = goalItem.querySelector('.goal-header');
        goalHeader.addEventListener('click', function() {
          goalItem.classList.toggle('collapsed');
        });
        
        // По умолчанию сворачиваем завершённые цели
        if (goal.completed) {
          goalItem.classList.add('collapsed');
        }
        
        // Анимация появления элементов с задержкой
        setTimeout(() => {
          goalItem.classList.add('visible');
        }, 100 * index);
      });
    })
    .catch(error => {
      console.error('Ошибка загрузки целей:', error);
      document.getElementById('goalsList').innerHTML = 
        '<p style="color: red;">Не удалось загрузить список целей. Пожалуйста, попробуйте позже.</p>';
    });
});

