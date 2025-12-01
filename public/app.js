document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('eventList');
    const searchInput = document.getElementById('searchInput');
    const searchContainer = document.querySelector('.search-container');
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');
    const addEventForm = document.getElementById('addEventForm');
    const modalTitle = document.querySelector('.modal-header h2');
    const submitBtn = addEventForm.querySelector('button[type="submit"]');
    const eventUidInput = document.getElementById('eventUid');
    const addEventModal = document.getElementById('addEventModal');
    const viewEventModal = document.getElementById('viewEventModal');
    const fabAddEvent = document.getElementById('fabAddEvent');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeViewModalBtn = document.getElementById('closeViewModalBtn');
    const toastContainer = document.getElementById('toastContainer');
    const rawEventContent = document.getElementById('rawEventContent');
    const settingsBtn = document.getElementById('settingsBtn');
    const headerAddEventBtn = document.getElementById('headerAddEventBtn');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const timeFmtBtns = document.querySelectorAll('.time-fmt-btn');

    const listViewBtn = document.getElementById('listViewBtn');
    const calendarViewBtn = document.getElementById('calendarViewBtn');
    const listViewSection = document.getElementById('listViewSection');
    const calendarViewSection = document.getElementById('calendarViewSection');
    
    // Calendar Navigation & Views
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const todayBtn = document.getElementById('todayBtn');
    const currentDateLabel = document.getElementById('currentDateLabel');
    
    const monthViewBtn = document.getElementById('monthViewBtn');
    const weekViewBtn = document.getElementById('weekViewBtn');
    const dayViewBtn = document.getElementById('dayViewBtn');
    
    const monthViewContainer = document.getElementById('monthViewContainer');
    const timeGridContainer = document.getElementById('timeGridContainer');
    const calendarGrid = document.getElementById('calendarGrid');
    const timeGridHeader = document.getElementById('timeGridHeader');
    const timeGridContent = document.getElementById('timeGridContent');
    const timeColumn = document.querySelector('.time-column');

    let currentView = 'month'; // Default to 'month'
    let currentCalendarDate = new Date();
    let allEvents = []; // Store fetched events for calendar filtering

    const viewRawBtn = document.getElementById('viewRawBtn');

    // Theme Logic
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
        });
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update active state of buttons
        themeBtns.forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Time Format Logic
    let timeFormat = localStorage.getItem('timeFormat') || '12h';
    setTimeFormat(timeFormat);

    timeFmtBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            setTimeFormat(format);
            // Re-render current view
            if (currentView === 'list') {
                renderEvents(allEvents);
            } else {
                renderCalendar();
            }
        });
    });

    function setTimeFormat(format) {
        timeFormat = format;
        localStorage.setItem('timeFormat', format);
        
        timeFmtBtns.forEach(btn => {
            if (btn.dataset.format === format) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Settings Panel Logic
    function openSettings() {
        settingsOverlay.classList.add('active');
    }

    function closeSettings() {
        settingsOverlay.classList.remove('active');
    }

    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    
    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) {
            closeSettings();
        }
    });

    // Escape key to close settings
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (settingsOverlay.classList.contains('active')) closeSettings();
        }
    });

    // Modal Logic
    function openModal(event = null) {
        if (event) {
            // Edit Mode
            modalTitle.textContent = 'Edit Event';
            submitBtn.textContent = 'Save Changes';
            eventUidInput.value = event.uid;
            
            // Show View Raw button
            viewRawBtn.style.display = 'block';
            viewRawBtn.onclick = () => {
                rawEventContent.textContent = event.raw;
                viewEventModal.classList.add('active');
            };
            
            document.getElementById('summary').value = event.summary;
            document.getElementById('description').value = event.description || '';
            document.getElementById('location').value = event.location || '';
            
            // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
            const formatDate = (dateStr) => {
                // dateStr is already ISO UTC (e.g. 2025-11-30T15:00:00.000Z)
                // We want 2025-11-30T15:00
                return dateStr.slice(0, 16);
            };
            
            document.getElementById('startDate').value = formatDate(event.startDate);
            if (event.endDate) {
                document.getElementById('endDate').value = formatDate(event.endDate);
            }
        } else {
            // Add Mode
            modalTitle.textContent = 'Add Event';
            submitBtn.textContent = 'Create Event';
            addEventForm.reset();
            eventUidInput.value = '';
            
            // Hide View Raw button
            viewRawBtn.style.display = 'none';
        }
        
        addEventModal.classList.add('active');
        document.getElementById('summary').focus();
    }

    function closeModal() {
        addEventModal.classList.remove('active');
        addEventForm.reset();
        eventUidInput.value = '';
    }

    function closeViewModal() {
        viewEventModal.classList.remove('active');
        rawEventContent.textContent = '';
    }

    fabAddEvent.addEventListener('click', () => openModal(null));
    headerAddEventBtn.addEventListener('click', () => openModal(null));
    closeModalBtn.addEventListener('click', closeModal);
    closeViewModalBtn.addEventListener('click', closeViewModal);
    
    // Close modal when clicking outside
    addEventModal.addEventListener('click', (e) => {
        if (e.target === addEventModal) {
            closeModal();
        }
    });

    viewEventModal.addEventListener('click', (e) => {
        if (e.target === viewEventModal) {
            closeViewModal();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (addEventModal.classList.contains('active')) closeModal();
            if (viewEventModal.classList.contains('active')) closeViewModal();
        }
    });

    // Toast Notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '✅' : '❌';
        toast.innerHTML = `<span>${icon}</span> ${message}`;
        
        toastContainer.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Fetch and display events
    async function fetchEvents() {
        const query = searchInput.value;
        const startDate = startDateFilter.value;
        const endDate = endDateFilter.value;

        let url = '/api/events';
        const params = new URLSearchParams();
        
        if (query) params.append('q', query);
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);

        if (params.toString()) {
            url += `/search?${params.toString()}`;
        }

        try {
            const response = await fetch(url);
            allEvents = await response.json();
            
            if (currentView === 'list') {
                renderEvents(allEvents);
            } else {
                renderCalendar();
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            showToast('Failed to load events', 'error');
        }
    }

    // Render events to DOM (List View)
    function renderEvents(events) {
        eventList.innerHTML = '';
        if (events.length === 0) {
            eventList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <h3>No Events Found</h3>
                    <p>Your calendar is looking a bit empty. Why not add some events?</p>
                    <button class="btn-primary" onclick="document.getElementById('headerAddEventBtn').click()">Create Event</button>
                </div>
            `;
            return;
        }

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            
            const startDate = new Date(event.startDate).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
                hour12: timeFormat === '12h',
                timeZone: 'UTC'
            });
            
            const endDate = event.endDate ? new Date(event.endDate).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
                hour12: timeFormat === '12h',
                timeZone: 'UTC'
            }) : '';
            
            const dateStr = endDate ? `${startDate} - ${endDate}` : startDate;

            card.innerHTML = `
                <div class="event-info">
                    <h3>${escapeHtml(event.summary)}</h3>
                    <div class="event-meta">
                        <span>${event.isRecurring ? '🔄' : '🗓️'} ${dateStr}</span>
                        ${event.location ? `<span>📍 ${escapeHtml(event.location)}</span>` : ''}
                    </div>
                    ${event.description ? `<p class="event-desc">${escapeHtml(event.description)}</p>` : ''}
                </div>
                <div class="event-actions">
                    <button class="btn-view" aria-label="View raw event">👁️</button>
                    <button class="btn-edit" aria-label="Edit event">Edit</button>
                    <button class="btn-delete" data-uid="${event.uid}" aria-label="Delete event">Delete</button>
                </div>
            `;
            
            // Add edit listener
            const editBtn = card.querySelector('.btn-edit');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(event);
            });

            // Add view listener
            const viewBtn = card.querySelector('.btn-view');
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                rawEventContent.textContent = event.raw;
                viewEventModal.classList.add('active');
            });

            // Add card click listener for details/edit
            card.addEventListener('click', () => openModal(event));
            
            eventList.appendChild(card);
        });

        // Add delete listeners
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent card click
                const uid = e.target.dataset.uid;
                if (confirm('Are you sure you want to delete this event?')) {
                    await deleteEvent(uid);
                }
            });
        });
    }

    // Render Calendar View
    function renderCalendar() {
        if (currentView === 'month') {
            renderMonthView();
        } else if (currentView === 'week') {
            renderWeekView();
        } else if (currentView === 'day') {
            renderDayView();
        }
    }

    function renderMonthView() {
        monthViewContainer.style.display = 'block';
        timeGridContainer.style.display = 'none';
        
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        
        const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
        currentDateLabel.textContent = `${monthName} ${year}`;
        
        calendarGrid.innerHTML = '';
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay();
        
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            
            if (isToday(date)) {
                cell.classList.add('today');
            }
            
            const dayNum = document.createElement('div');
            dayNum.className = 'day-number';
            dayNum.textContent = day;
            cell.appendChild(dayNum);
            
            const dayEvents = allEvents.filter(event => isSameDay(new Date(event.startDate), date));
            
            dayEvents.forEach(event => {
                const eventEl = createEventElement(event);
                cell.appendChild(eventEl);
            });
            
            cell.addEventListener('click', () => {
                openModal(null);
                document.getElementById('startDate').value = toLocalISOString(date);
            });
            
            calendarGrid.appendChild(cell);
        }
    }

    function renderWeekView() {
        monthViewContainer.style.display = 'none';
        timeGridContainer.style.display = 'block';
        
        // Calculate start of week (Sunday)
        const startOfWeek = new Date(currentCalendarDate);
        startOfWeek.setDate(currentCalendarDate.getDate() - currentCalendarDate.getDay());
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const startMonth = startOfWeek.toLocaleString('default', { month: 'short' });
        const endMonth = endOfWeek.toLocaleString('default', { month: 'short' });
        const year = startOfWeek.getFullYear();
        
        currentDateLabel.textContent = `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${year}`;
        
        renderTimeGrid(startOfWeek, 7);
    }

    function renderDayView() {
        monthViewContainer.style.display = 'none';
        timeGridContainer.style.display = 'block';
        
        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        currentDateLabel.textContent = currentCalendarDate.toLocaleDateString(undefined, dateOptions);
        
        renderTimeGrid(currentCalendarDate, 1);
    }

    function renderTimeGrid(startDate, days) {
        // Render Header
        timeGridHeader.innerHTML = '';
        timeGridContent.innerHTML = '';
        
        // Render Time Column (Labels)
        timeColumn.innerHTML = '';
        for (let i = 0; i < 24; i++) {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            
            let timeText;
            if (timeFormat === '12h') {
                const ampm = i >= 12 ? 'PM' : 'AM';
                const hour12 = i % 12 || 12;
                timeText = `${hour12} ${ampm}`;
            } else {
                timeText = i.toString().padStart(2, '0') + ':00';
            }
            
            timeLabel.textContent = timeText;
            timeColumn.appendChild(timeLabel);
        }
        
        // Render Days
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            // Header Cell
            const headerCell = document.createElement('div');
            headerCell.className = 'time-grid-header-cell';
            if (isToday(date)) headerCell.classList.add('today');
            
            const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
            const dayNum = date.getDate();
            headerCell.textContent = `${dayName} ${dayNum}`;
            timeGridHeader.appendChild(headerCell);
            
            // Body Column
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';
            
            // Time Slots (Grid Lines)
            for (let h = 0; h < 24; h++) {
                const slot = document.createElement('div');
                slot.className = 'time-slot';
                dayColumn.appendChild(slot);
            }
            
            // Current Time Indicator (if today)
            if (isToday(date)) {
                const now = new Date();
                const minutes = now.getHours() * 60 + now.getMinutes();
                const top = (minutes / 1440) * 100; // Percentage
                
                const indicator = document.createElement('div');
                indicator.className = 'current-time-indicator';
                indicator.style.top = `${top}%`;
                dayColumn.appendChild(indicator);
            }
            
            // Events
            const dayEvents = allEvents.filter(event => isSameDay(new Date(event.startDate), date));
            dayEvents.forEach(event => {
                const eventStart = new Date(event.startDate);
                const eventEnd = event.endDate ? new Date(event.endDate) : new Date(eventStart.getTime() + 60 * 60 * 1000); // Default 1h
                
                const startMinutes = eventStart.getUTCHours() * 60 + eventStart.getUTCMinutes();
                const endMinutes = eventEnd.getUTCHours() * 60 + eventEnd.getUTCMinutes();
                const duration = endMinutes - startMinutes;
                
                const top = (startMinutes / 1440) * 100;
                const height = (duration / 1440) * 100;
                
                const eventEl = document.createElement('div');
                eventEl.className = `time-grid-event ${event.isRecurring ? 'recurring' : ''}`;
                eventEl.style.top = `${top}%`;
                eventEl.style.height = `${height}%`;
                eventEl.textContent = event.summary;
                eventEl.title = `${event.summary} (${eventStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: timeFormat === '12h', timeZone: 'UTC'})})`;
                
                eventEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openModal(event);
                });
                
                dayColumn.appendChild(eventEl);
            });
            
            // Click to add event
            dayColumn.addEventListener('click', (e) => {
                if (e.target !== dayColumn && !e.target.classList.contains('time-slot')) return;
                
                openModal(null);
                document.getElementById('startDate').value = toLocalISOString(date);
            });
            
            timeGridContent.appendChild(dayColumn);
        }
    }

    // Helper Functions
    function isToday(date) {
        const today = new Date();
        return isSameDay(date, today);
    }

    function isSameDay(d1, d2) {
        return d1.getDate() === d2.getDate() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getFullYear() === d2.getFullYear();
    }

    function createEventElement(event) {
        const eventEl = document.createElement('div');
        eventEl.className = `calendar-event ${event.isRecurring ? 'recurring' : ''}`;
        eventEl.textContent = event.summary;
        eventEl.title = `${event.summary}`;
        
        eventEl.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(event);
        });
        
        return eventEl;
    }
    
    function toLocalISOString(date) {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 16);
    }

    // View Toggle Logic
    listViewBtn.addEventListener('click', () => {
        console.log('List view clicked. Current view:', currentView);
        if (currentView === 'list') {
            console.log('Already in list view, ignoring.');
            return;
        }
        currentView = 'list';
        listViewBtn.classList.add('active');
        calendarViewBtn.classList.remove('active');
        listViewSection.style.display = 'block';
        calendarViewSection.style.display = 'none';
        updateSearchVisibility();
        renderEvents(allEvents);
        console.log('Switched to list view');
    });

    calendarViewBtn.addEventListener('click', () => {
        console.log('Calendar toggle clicked. Current view:', currentView);
        if (currentView !== 'list') {
            console.log('Already in calendar view (or sub-view), ignoring.');
            return;
        }
        currentView = 'month'; // Default to month view
        calendarViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        calendarViewSection.style.display = 'block';
        listViewSection.style.display = 'none';
        
        // Update sub-view buttons
        updateViewButtons('month');
        updateSearchVisibility();
        renderCalendar();
        console.log('Switched to calendar view (month)');
    });

    // Sub-View Switcher
    function updateViewButtons(view) {
        console.log('Updating view buttons for:', view);
        monthViewBtn.classList.toggle('active', view === 'month');
        weekViewBtn.classList.toggle('active', view === 'week');
        dayViewBtn.classList.toggle('active', view === 'day');
    }

    monthViewBtn.addEventListener('click', () => {
        console.log('Month view clicked');
        currentView = 'month';
        updateViewButtons('month');
        renderCalendar();
    });

    weekViewBtn.addEventListener('click', () => {
        console.log('Week view clicked');
        currentView = 'week';
        updateViewButtons('week');
        renderCalendar();
    });

    dayViewBtn.addEventListener('click', () => {
        console.log('Day view clicked');
        currentView = 'day';
        updateViewButtons('day');
        renderCalendar();
    });

    // Navigation
    prevBtn.addEventListener('click', () => {
        if (currentView === 'month') {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        } else if (currentView === 'week') {
            currentCalendarDate.setDate(currentCalendarDate.getDate() - 7);
        } else if (currentView === 'day') {
            currentCalendarDate.setDate(currentCalendarDate.getDate() - 1);
        }
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        if (currentView === 'month') {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        } else if (currentView === 'week') {
            currentCalendarDate.setDate(currentCalendarDate.getDate() + 7);
        } else if (currentView === 'day') {
            currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
        }
        renderCalendar();
    });

    todayBtn.addEventListener('click', () => {
        currentCalendarDate = new Date();
        renderCalendar();
    });

    // Add/Edit event
    addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addEventForm);
        const uid = formData.get('uid');
        
        const eventData = {
            summary: formData.get('summary'),
            description: formData.get('description'),
            location: formData.get('location'),
            // Treat input as UTC by appending Z (verified by test/time_conversion.test.js)
            startDate: new Date(formData.get('startDate') + ':00Z').toISOString(),
            endDate: formData.get('endDate') ? new Date(formData.get('endDate') + ':00Z').toISOString() : null
        };

        try {
            let response;
            if (uid) {
                // Update existing event
                response = await fetch(`/api/events/${uid}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData)
                });
            } else {
                // Create new event
                response = await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData)
                });
            }

            if (response.ok) {
                closeModal();
                showToast(uid ? 'Event updated successfully' : 'Event added successfully');
                fetchEvents(); // Reload events
            } else {
                showToast(uid ? 'Failed to update event' : 'Failed to add event', 'error');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            showToast('Error saving event', 'error');
        }
    });

    // Delete event
    async function deleteEvent(uid) {
        try {
            const response = await fetch(`/api/events/${uid}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Event deleted successfully');
                // Animate removal
                if (currentView === 'list') {
                    const btn = document.querySelector(`.btn-delete[data-uid="${uid}"]`);
                    if (btn) {
                        const card = btn.closest('.event-card');
                        card.style.opacity = '0';
                        card.style.transform = 'translateX(20px)';
                        setTimeout(() => {
                            fetchEvents();
                        }, 300);
                    } else {
                        fetchEvents();
                    }
                } else {
                    fetchEvents();
                }
            } else {
                showToast('Failed to delete event', 'error');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            showToast('Error deleting event', 'error');
        }
    }

    // Search functionality
    let debounceTimer;
    const handleSearch = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchEvents();
        }, 300);
    };

    searchInput.addEventListener('input', handleSearch);
    startDateFilter.addEventListener('change', handleSearch);
    endDateFilter.addEventListener('change', handleSearch);

    // Search Visibility Logic
    function updateSearchVisibility() {
        if (currentView === 'list') {
            searchContainer.style.display = 'flex';
        } else {
            searchContainer.style.display = 'none';
        }
    }

    // Initial load
    if (currentView === 'month') {
        listViewBtn.classList.remove('active');
        calendarViewBtn.classList.add('active');
        listViewSection.style.display = 'none';
        calendarViewSection.style.display = 'block';
        updateViewButtons('month');
    }
    updateSearchVisibility();
    fetchEvents();

    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
