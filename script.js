// العناصر الأساسية في DOM

const notesList = document.getElementById('notes-list');

const tasksList = document.getElementById('tasks-list');

const remindersList = document.getElementById('reminders-list');

const addNoteBtn = document.getElementById('add-note-btn');

const noteModal = document.getElementById('note-modal');

const closeBtn = document.querySelector('.close-btn');

const cancelNoteBtn = document.getElementById('cancel-note-btn');

const noteForm = document.getElementById('note-form');

const searchInput = document.getElementById('search-input');

const searchBtn = document.getElementById('search-btn');

const themeToggle = document.getElementById('theme-toggle');

const tabBtns = document.querySelectorAll('.tab-btn');

const tabContents = document.querySelectorAll('.tab-content');

const categoryItems = document.querySelectorAll('#categories li');

const calendarEl = document.getElementById('calendar');

// حالة التطبيق

let notes = JSON.parse(localStorage.getItem('notes')) || [];

let currentTab = 'notes';

let currentCategory = 'all';

let editingNoteId = null;

let isDarkMode = localStorage.getItem('darkMode') === 'true';

// تهيئة التطبيق

function init() {

    // تطبيق وضع الألوان المحفوظ

    applyThemeMode();

    

    // إنشاء التقويم

    renderCalendar();

    

    // عرض الملاحظات

    renderNotes();

    

    // عرض المهام

    renderTasks();

    

    // عرض التذكيرات

    renderReminders();

    

    // إضافة المستمعين للأحداث

    setupEventListeners();

}

// تطبيق وضع الألوان

function applyThemeMode() {

    if (isDarkMode) {

        document.body.classList.add('dark-mode');

        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';

    } else {

        document.body.classList.remove('dark-mode');

        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';

    }

}

// إنشاء التقويم

function renderCalendar() {

    const now = new Date();

    const year = now.getFullYear();

    const month = now.getMonth();

    

    // عناوين الأشهر والأيام

    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 

                      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    const dayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

    

    // تاريخ اليوم

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    

    // عدد أيام الشهر الحالي

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    

    // يوم الأسبوع لأول يوم في الشهر

    const firstDay = new Date(year, month, 1).getDay();

    

    // HTML للتقويم

    let calendarHTML = `

        <div class="calendar-header">

            <button id="prev-month"><i class="fas fa-chevron-right"></i></button>

            <div class="calendar-title">${monthNames[month]} ${year}</div>

            <button id="next-month"><i class="fas fa-chevron-left"></i></button>

        </div>

        <div class="calendar-grid">

    `;

    

    // عناوين الأيام

    dayNames.forEach(day => {

        calendarHTML += `<div class="calendar-day-header">${day}</div>`;

    });

    

    // أيام الشهر السابق

    for (let i = 0; i < firstDay; i++) {

        calendarHTML += `<div class="calendar-day other-month"></div>`;

    }

    

    // أيام الشهر الحالي

    for (let i = 1; i <= daysInMonth; i++) {

        const date = new Date(year, month, i);

        const isToday = date.getTime() === today.getTime();

        const hasNotes = notes.some(note => {

            const noteDate = new Date(note.dueDate);

            return noteDate && noteDate.toDateString() === date.toDateString();

        });

        

        calendarHTML += `

            <div class="calendar-day ${isToday ? 'today' : ''} ${hasNotes ? 'has-notes' : ''}" 

                 data-date="${date.toISOString()}">

                ${i}

                ${hasNotes ? '<span class="note-indicator"></span>' : ''}

            </div>

        `;

    }

    

    // إكمال الصف الأخير

    const totalCells = firstDay + daysInMonth;

    const remainingCells = 7 - (totalCells % 7);

    

    if (remainingCells < 7) {

        for (let i = 0; i < remainingCells; i++) {

            calendarHTML += `<div class="calendar-day other-month"></div>`;

        }

    }

    

    calendarHTML += `</div>`;

    calendarEl.innerHTML = calendarHTML;

    

    // إضافة مستمعي الأحداث لأزرار الشهر

    document.getElementById('prev-month').addEventListener('click', () => {

        // الانتقال للشهر السابق

        console.log('الشهر السابق');

    });

    

    document.getElementById('next-month').addEventListener('click', () => {

        // الانتقال للشهر التالي

        console.log('الشهر التالي');

    });

    

    // مستمعي الأحداث لأيام التقويم

    document.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {

        day.addEventListener('click', () => {

            const date = new Date(day.dataset.date);

            filterByDate(date);

        });

    });

}

// تصفية الملاحظات حسب التاريخ

function filterByDate(date) {

    const dateStr = date.toDateString();

    const filteredNotes = notes.filter(note => {

        if (!note.dueDate) return false;

        const noteDate = new Date(note.dueDate);

        return noteDate.toDateString() === dateStr;

    });

    

    renderNotes(filteredNotes);

    renderTasks(filteredNotes.filter(note => note.type === 'task'));

    renderReminders(filteredNotes.filter(note => note.type === 'reminder'));

}

// عرض الملاحظات

function renderNotes(filteredNotes = null) {

    const notesToRender = filteredNotes || notes.filter(note => note.type === 'note');

    

    if (currentCategory !== 'all') {

        notesToRender = notesToRender.filter(note => note.category === currentCategory);

    }

    

    if (notesToRender.length === 0) {

        notesList.innerHTML = '<p class="no-notes">لا توجد ملاحظات لعرضها</p>';

        return;

    }

    

    notesList.innerHTML = notesToRender.map(note => `

        <div class="note-card" data-id="${note.id}">

            <div class="note-actions">

                <button class="edit-btn" data-id="${note.id}"><i class="fas fa-edit"></i></button>

                <button class="delete-btn" data-id="${note.id}"><i class="fas fa-trash"></i></button>

            </div>

            <h3>${note.title}</h3>

            <p>${note.content}</p>

            <div class="note-meta">

                <span class="category-badge">${getCategoryName(note.category)}</span>

                <span>${formatDate(note.createdAt)}</span>

            </div>

        </div>

    `).join('');

    

    // إضافة مستمعي الأحداث لأزرار التعديل والحذف

    document.querySelectorAll('.edit-btn').forEach(btn => {

        btn.addEventListener('click', (e) => {

            e.stopPropagation();

            const noteId = btn.dataset.id;

            editNote(noteId);

        });

    });

    

    document.querySelectorAll('.delete-btn').forEach(btn => {

        btn.addEventListener('click', (e) => {

            e.stopPropagation();

            const noteId = btn.dataset.id;

            deleteNote(noteId);

        });

    });

    

    // مستمعي الأحداث لبطاقات الملاحظات

    document.querySelectorAll('.note-card').forEach(card => {

        card.addEventListener('click', () => {

            const noteId = card.dataset.id;

            viewNoteDetails(noteId);

        });

    });

}

// عرض المهام

function renderTasks(filteredTasks = null) {

    const tasksToRender = filteredTasks || notes.filter(note => note.type === 'task');

    

    if (currentCategory !== 'all') {

        tasksToRender = tasksToRender.filter(note => note.category === currentCategory);

    }

    

    if (tasksToRender.length === 0) {

        tasksList.innerHTML = '<p class="no-tasks">لا توجد مهام لعرضها</p>';

        return;

    }

    

    tasksList.innerHTML = tasksToRender.map(task => {

        const dueDate = task.dueDate ? new Date(task.dueDate) : null;

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        

        let dueStatus = '';

        if (dueDate) {

            const dueTime = dueDate.getTime();

            const todayTime = today.getTime();

            

            if (dueTime < todayTime) {

                dueStatus = 'overdue';

            } else if (dueTime === todayTime) {

                dueStatus = 'today';

            } else {

                dueStatus = 'upcoming';

            }

        }

        

        return `

            <div class="task-card" data-id="${task.id}">

                <div class="task-actions">

                    <button class="edit-btn" data-id="${task.id}"><i class="fas fa-edit"></i></button>

                    <button class="delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i></button>

                    <button class="complete-btn" data-id="${task.id}">

                        <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>

                    </button>

                </div>

                <h3>${task.title}</h3>

                <p>${task.content}</p>

                <div class="task-meta">

                    <span class="category-badge">${getCategoryName(task.category)}</span>

                    <span class="priority-badge priority-${task.priority || 'medium'}">

                        ${getPriorityName(task.priority || 'medium')}

                    </span>

                    ${dueDate ? `

                        <span class="task-due ${dueStatus}">

                            <i class="fas fa-calendar-alt"></i> ${formatDate(dueDate)}

                        </span>

                    ` : ''}

                </div>

            </div>

        `;

    }).join('');

    

    // إضافة مستمعي الأحداث لأزرار المهام

    document.querySelectorAll('.task-card .edit-btn').forEach(btn => {

        btn.addEventListener('click', (e) => {

            e.stopPropagation();

            const taskId = btn.dataset.id;

            editNote(taskId);

        });

    });

    

    document.querySelectorAll('.task-card .delete-btn').forEach(btn => {

        btn.addEventListener('click', (e) => {

            e.stopPropagation();

            const taskId = btn.dataset.id;

            deleteNote(taskId);

        });

    });

    

    document.querySelectorAll('.task-card .complete-btn').forEach(btn => {

        btn.addEventListener('click', (e) => {

            e.stopPropagation();

            const taskId = btn.dataset.id;

            toggleTaskCompletion(taskId);

        });

    });

}

// عرض التذكيرات

function renderReminders(filteredReminders = null) {

    const remindersToRender = filteredReminders || notes.filter(note => note.type === 'reminder');

    

    if (currentCategory !== 'all') {

        remindersToRender = remindersToRender.filter(note => note.category === currentCategory);

    }

    

    if (remindersToRender.length === 0) {

        remindersList.innerHTML = '<p class="no-reminders">لا توجد تذكيرات لعرضها</p>';

        return;

    }

    

    remindersList.innerHTML = remindersToRender.map(reminder => {

        const dueDate = reminder.dueDate ? new Date(reminder.dueDate) : null;

        

        return `

            <div class="reminder-card" data-id="${reminder.id}">

                <div class="reminder-actions">

                    <button class="edit-btn" data-id="${reminder.id}"><i class="fas fa-edit"></i></button>

                    <button class="delete-btn" data-id="${reminder.id}"><i class="fas fa-trash"></i></button>

                    <button class="snooze-btn" data-id="${reminder.id}"><i class="fas fa-clock"></i></button>

                </div>

                <h3>${reminder.title}</h3>

                <p>${reminder.content}</p>

                <div class="reminder-meta">

                    <span class="category-badge">${getCategoryName(reminder.category)}</span>

                    ${dueDate ? `

                        <span class="reminder-due">

                            <i class="fas fa-bell"></i> ${formatDateTime(dueDate)}

                        </span>

                    ` : ''}

                </div>

            </div>

        `;

    }).join('');

    

    // إضافة مستمعي الأحداث لأزرار التذكيرات

    document.querySelectorAll('.reminder-card .edit-btn').forEach(btn => {

        btn.addEventListener('click', (e) => {

            e.stopPropagation();

            const reminderId = btn.dataset.id;

            editNote(reminderId);

        });

    });

    

    document.querySelectorAll('.reminder-card .delete-btn').forEach(btn => {

        btn.addEventListener('click', (e) => {

            e.stopPropagation();

            const reminderId = btn.dataset.id;

            deleteNote(reminderId);

        });

    });

    

    document.querySelectorAll('.reminder-card .snooze-btn').forEach(btn => {

        btn.addEventListener('click', (e) => {

            e.stopPropagation();

            const reminderId = btn.dataset.id;

            snoozeReminder(reminderId);

        });

    });

}

// إضافة ملاحظة جديدة

function addNewNote() {

    editingNoteId = null;

    document.getElementById('modal-title').textContent = 'إضافة ملاحظة جديدة';

    document.getElementById('note-form').reset();

    document.getElementById('note-id').value = '';

    document.getElementById('task-fields').style.display = 'none';

    noteModal.style.display = 'flex';

}

// تعديل ملاحظة موجودة

function editNote(noteId) {

    const note = notes.find(n => n.id === noteId);

    if (!note) return;

    

    editingNoteId = noteId;

    document.getElementById('modal-title').textContent = 'تعديل الملاحظة';

    document.getElementById('note-id').value = note.id;

    document.getElementById('note-title').value = note.title;

    document.getElementById('note-content').value = note.content;

    document.getElementById('note-category').value = note.category || 'work';

    

    if (note.type === 'task' || note.type === 'reminder') {

        document.getElementById('task-fields').style.display = 'block';

        document.getElementById('note-due-date').value = note.dueDate ? note.dueDate.split('T')[0] : '';

        document.getElementById('note-priority').value = note.priority || 'medium';

    } else {

        document.getElementById('task-fields').style.display = 'none';

    }

    

    noteModal.style.display = 'flex';

}

// عرض تفاصيل الملاحظة

function viewNoteDetails(noteId) {

    const note = notes.find(n => n.id === noteId);

    if (!note) return;

    

    // يمكنك إنشاء مودال خاص لعرض التفاصيل هنا

    alert(`عنوان: ${note.title}\n\nمحتوى: ${note.content}`);

}

// حذف ملاحظة

function deleteNote(noteId) {

    if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {

        notes = notes.filter(note => note.id !== noteId);

        saveNotes();

        renderNotes();

        renderTasks();

        renderReminders();

    }

}

// تبديل حالة إكمال المهمة

function toggleTaskCompletion(taskId) {

    const taskIndex = notes.findIndex(n => n.id === taskId);

    if (taskIndex === -1) return;

    

    notes[taskIndex].completed = !notes[taskIndex].completed;

    saveNotes();

    renderTasks();

}

// تأجيل التذكير

function snoozeReminder(reminderId) {

    const reminder = notes.find(n => n.id === reminderId);

    if (!reminder || !reminder.dueDate) return;

    

    const newDate = new Date(reminder.dueDate);

    newDate.setMinutes(newDate.getMinutes() + 10); // تأجيل لمدة 10 دقائق

    

    reminder.dueDate = newDate.toISOString();

    saveNotes();

    renderReminders();

    

    alert('تم تأجيل التذكير لمدة 10 دقائق');

}

// حفظ الملاحظات

function saveNotes() {

    localStorage.setItem('notes', JSON.stringify(notes));

    checkReminders();

}

// التحقق من التذكيرات

function checkReminders() {

    const now = new Date();

    notes.filter(note => note.type === 'reminder' && note.dueDate).forEach(note => {

        const reminderTime = new Date(note.dueDate);

        if (now >= reminderTime) {

            showNotification(note.title, note.content);

        }

    });

}

// عرض الإشعارات

function showNotification(title, body) {

    if (!('Notification' in window)) {

        alert('المتصفح لا يدعم الإشعارات');

        return;

    }

    

    if (Notification.permission === 'granted') {

        new Notification(title, { body });

    } else if (Notification.permission !== 'denied') {

        Notification.requestPermission().then(permission => {

            if (permission === 'granted') {

                new Notification(title, { body });

            }

        });

    }

}

// البحث في الملاحظات

function searchNotes() {

    const searchTerm = searchInput.value.toLowerCase();

    if (!searchTerm) {

        renderNotes();

        renderTasks();

        renderReminders();

        return;

    }

    

    const filteredNotes = notes.filter(note => 

        note.title.toLowerCase().includes(searchTerm) || 

        note.content.toLowerCase().includes(searchTerm)

    );

    

    renderNotes(filteredNotes.filter(note => note.type === 'note'));

    renderTasks(filteredNotes.filter(note => note.type === 'task'));

    renderReminders(filteredNotes.filter(note => note.type === 'reminder'));

}

// تبديل وضع الألوان

function toggleTheme() {

    isDarkMode = !isDarkMode;

    localStorage.setItem('darkMode', isDarkMode);

    applyThemeMode();

}

// تبديل التبويبات

function switchTab(tabName) {

    currentTab = tabName;

    

    tabBtns.forEach(btn => {

        if (btn.dataset.tab === tabName) {

            btn.classList.add('active');

        } else {

            btn.classList.remove('active');

        }

    });

    

    tabContents.forEach(content => {

        if (content.id === `${tabName}-tab`) {

            content.classList.add('active');

        } else {

            content.classList.remove('active');

        }

    });

    

    // إعادة عرض المحتوى حسب التبويب المحدد

    if (tabName === 'notes') {

        renderNotes();

    } else if (tabName === 'tasks') {

        renderTasks();

    } else if (tabName === 'reminders') {

        renderReminders();

    }

}

// تصفية حسب التصنيف

function filterByCategory(category) {

    currentCategory = category;

    

    categoryItems.forEach(item => {

        if (item.dataset.category === category) {

            item.classList.add('active');

        } else {

            item.classList.remove('active');

        }

    });

    

    // إعادة عرض المحتوى حسب التصنيف المحدد

    if (currentTab === 'notes') {

        renderNotes();

    } else if (currentTab === 'tasks') {

        renderTasks();

    } else if (currentTab === 'reminders') {

        renderReminders();

    }

}

// معالجة إرسال النموذج

function handleFormSubmit(e) {

    e.preventDefault();

    

    const noteId = document.getElementById('note-id').value;

    const title = document.getElementById('note-title').value;

    const content = document.getElementById('note-content').value;

    const category = document.getElementById('note-category').value;

    const dueDate = document.getElementById('note-due-date').value;

    const priority = document.getElementById('note-priority').value;

    

    if (!title || !content) {

        alert('الرجاء إدخال عنوان ومحتوى للملاحظة');

        return;

    }

    

    const now = new Date().toISOString();

    

    if (noteId) {

        // تعديل ملاحظة موجودة

        const noteIndex = notes.findIndex(n => n.id === noteId);

        if (noteIndex !== -1) {

            notes[noteIndex] = {

                ...notes[noteIndex],

                title,

                content,

                category,

                dueDate: dueDate ? new Date(dueDate).toISOString() : null,

                priority: currentTab === 'tasks' ? priority : null

            };

        }

    } else {

        // إضافة ملاحظة جديدة

        const newNote = {

            id: generateId(),

            type: currentTab === 'tasks' ? 'task' : (currentTab === 'reminders' ? 'reminder' : 'note'),

            title,

            content,

            category,

            createdAt: now,

            completed: false,

            dueDate: dueDate ? new Date(dueDate).toISOString() : null,

            priority: currentTab === 'tasks' ? priority : null

        };

        

        notes.push(newNote);

    }

    

    saveNotes();

    noteModal.style.display = 'none';

    

    // إعادة عرض المحتوى حسب التبويب المحدد

    if (currentTab === 'notes') {

        renderNotes();

    } else if (currentTab === 'tasks') {

        renderTasks();

    } else if (currentTab === 'reminders') {

        renderReminders();

    }

}

// توليد معرف فريد

function generateId() {

    return Date.now().toString(36) + Math.random().toString(36).substr(2);

}

// تنسيق التاريخ

function formatDate(dateString) {

    if (!dateString) return '';

    

    const date = new Date(dateString);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    return date.toLocaleDateString('ar-EG', options);

}

// تنسيق التاريخ والوقت

function formatDateTime(dateString) {

    if (!dateString) return '';

    

    const date = new Date(dateString);

    const options = { 

        year: 'numeric', 

        month: 'long', 

        day: 'numeric',

        hour: '2-digit',

        minute: '2-digit'

    };

    return date.toLocaleDateString('ar-EG', options);

}

// الحصول على اسم التصنيف

function getCategoryName(category) {

    const categories = {

        'work': 'عمل',

        'personal': 'شخصي',

        'study': 'دراسة'

    };

    return categories[category] || category;

}

// الحصول على اسم الأولوية

function getPriorityName(priority) {

    const priorities = {

        'low': 'منخفضة',

        'medium': 'متوسطة',

        'high': 'عالية'

    };

    return priorities[priority] || priority;

}

// إعداد مستمعي الأحداث

function setupEventListeners() {

    // فتح وإغلاق المودال

    addNoteBtn.addEventListener('click', addNewNote);

    closeBtn.addEventListener('click', () => noteModal.style.display = 'none');

    cancelNoteBtn.addEventListener('click', () => noteModal.style.display = 'none');

    

    // النقر خارج المودال يغلقه

    window.addEventListener('click', (e) => {

        if (e.target === noteModal) {

            noteModal.style.display = 'none';

        }

    });

    

    // معالجة إرسال النموذج

    noteForm.addEventListener('submit', handleFormSubmit);

    

    // البحث

    searchBtn.addEventListener('click', searchNotes);

    searchInput.addEventListener('keyup', (e) => {

        if (e.key === 'Enter') searchNotes();

    });

    

    // تبديل وضع الألوان

    themeToggle.addEventListener('click', toggleTheme);

    

    // تبديل التبويبات

    tabBtns.forEach(btn => {

        btn.addEventListener('click', () => switchTab(btn.dataset.tab));

    });

    

    // تصفية حسب التصنيف

    categoryItems.forEach(item => {

        item.addEventListener('click', () => filterByCategory(item.dataset.category));

    });

}

// تهيئة التطبيق عند تحميل الصفحة

document.addEventListener('DOMContentLoaded', init);

// التحقق من التذكيرات كل دقيقة

setInterval(checkReminders, 60000);