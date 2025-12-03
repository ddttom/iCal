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
    const deleteEventBtn = document.getElementById('deleteEventBtn');
    const cancelEventBtn = document.getElementById('cancelEventBtn');
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
    const viewRawBtn = document.getElementById('viewRawBtn');
    const importEventBtn = document.getElementById('importEventBtn');
    const importEventModal = document.getElementById('importEventModal');
    const closeImportModalBtn = document.getElementById('closeImportModalBtn');
    const cancelImportBtn = document.getElementById('cancelImportBtn');
    const processImportBtn = document.getElementById('processImportBtn');
    const importContent = document.getElementById('importContent');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    let eventToDeleteId = null;
    const exportBtn = document.createElement('button'); // Create export button dynamically or assume it exists

    // Add Export Button to Header Actions
    exportBtn.className = 'btn-secondary btn-sm';
    exportBtn.innerHTML = '<i class="ph ph-upload-simple"></i> Export';
    exportBtn.onclick = () => {
        window.location.href = '/api/export';
    };
    document.querySelector('.header-actions').insertBefore(exportBtn, document.getElementById('settingsBtn'));

    // State
    let currentView = localStorage.getItem('currentView') || 'month';
    let allEvents = [];
    let totalDatabaseCount = 0;
    let calendarInstance = null;
    let currentPage = 1;
    const limit = 100; // Load 100 events at a time
    let isLoading = false;
    let observer = null;


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
        if (e.target === settingsOverlay) closeSettings();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (settingsOverlay.classList.contains('active')) closeSettings();
        }
    });

    // Modal Logic
    function openModal(event = null) {
        if (event) {
            modalTitle.textContent = 'Edit Event';
            submitBtn.textContent = 'Save Changes';
            eventUidInput.value = event.uid;
            viewRawBtn.style.display = 'block';
            viewRawBtn.onclick = () => {
                rawEventContent.textContent = event.raw;
                viewEventModal.classList.add('active');
            };
            document.getElementById('summary').value = event.summary;
            document.getElementById('description').value = event.description || '';
            document.getElementById('location').value = event.location || '';
            const formatDate = (dateStr) => dateStr.slice(0, 16);
            document.getElementById('startDate').value = formatDate(event.startDate.dateTime);
            if (event.endDate) {
                document.getElementById('endDate').value = formatDate(event.endDate.dateTime);
            }
            document.getElementById('rrule').value = event.recurrence || '';
            deleteEventBtn.style.display = 'flex';
            deleteEventBtn.onclick = () => {
                openDeleteModal(event.uid);
            };
        } else {
            modalTitle.textContent = 'Add Event';
            submitBtn.textContent = 'Create Event';
            addEventForm.reset();
            eventUidInput.value = '';
            viewRawBtn.style.display = 'none';
            deleteEventBtn.style.display = 'none';
            document.getElementById('rrule').value = '';
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
    cancelEventBtn.addEventListener('click', closeModal);
    closeViewModalBtn.addEventListener('click', closeViewModal);
    addEventModal.addEventListener('click', (e) => { if (e.target === addEventModal) closeModal(); });
    viewEventModal.addEventListener('click', (e) => { if (e.target === viewEventModal) closeViewModal(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (addEventModal.classList.contains('active')) closeModal();
            if (viewEventModal.classList.contains('active')) closeViewModal();
            if (importEventModal.classList.contains('active')) closeImportModal();
        }
    });

    // Import Modal Logic
    function openImportModal() {
        importEventModal.classList.add('active');
        importContent.value = '';
        importContent.focus();
    }

    function closeImportModal() {
        importEventModal.classList.remove('active');
        importContent.value = '';
    }

    importEventBtn.addEventListener('click', openImportModal);
    closeImportModalBtn.addEventListener('click', closeImportModal);
    cancelImportBtn.addEventListener('click', closeImportModal);
    importEventModal.addEventListener('click', (e) => { if (e.target === importEventModal) closeImportModal(); });

    // Delete Modal Logic
    function openDeleteModal(uid) {
        eventToDeleteId = uid;
        deleteConfirmModal.classList.add('active');
    }

    function closeDeleteModal() {
        deleteConfirmModal.classList.remove('active');
        eventToDeleteId = null;
    }

    closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    deleteConfirmModal.addEventListener('click', (e) => { if (e.target === deleteConfirmModal) closeDeleteModal(); });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (eventToDeleteId) {
            await deleteEvent(eventToDeleteId);
            closeDeleteModal();
            if (addEventModal.classList.contains('active')) {
                closeModal();
            }
        }
    });

    processImportBtn.addEventListener('click', async () => {
        const icalData = importContent.value.trim();
        if (!icalData) {
            showToast('Please paste iCal content', 'error');
            return;
        }

        try {
            const jcalData = ICAL.parse(icalData);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents('vevent');

            if (vevents.length === 0) {
                showToast('No events found in iCal data', 'error');
                return;
            }

            let successCount = 0;
            for (const vevent of vevents) {
                const event = new ICAL.Event(vevent);
                
                const summary = event.summary;
                const description = event.description;
                const location = event.location;
                const startDate = event.startDate ? event.startDate.toJSDate().toISOString() : null;
                const endDate = event.endDate ? event.endDate.toJSDate().toISOString() : null;

                if (!summary || !startDate) {
                    console.warn('Skipping invalid event:', event);
                    continue;
                }

                const eventData = {
                    summary,
                    description,
                    location,
                    startDate,
                    endDate
                };

                // Send to API
                try {
                    const response = await fetch('/api/events', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(eventData)
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        console.error('Failed to save event:', await response.text());
                    }
                } catch (err) {
                    console.error('Error saving imported event:', err);
                }
            }

            if (successCount > 0) {
                showToast(`Successfully imported ${successCount} events`);
                closeImportModal();
                fetchEvents();
            } else {
                showToast('Failed to import any events', 'error');
            }

        } catch (error) {
            console.error('Error parsing iCal data:', error);
            showToast('Invalid iCal data', 'error');
        }
    });

    // Toast Notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? '<i class="ph ph-check-circle"></i>' : '<i class="ph ph-warning-circle"></i>';
        toast.innerHTML = `<span>${icon}</span> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Fetch and display events
    async function fetchEvents(reset = true) {
        if (reset) {
            currentPage = 1;
            allEvents = [];
        }

        const query = searchInput.value;
        const startDate = startDateFilter.value;
        const endDate = endDateFilter.value;
        let url = '/api/events';
        const params = new URLSearchParams();
        
        params.append('page', currentPage);
        params.append('limit', limit);

        if (query) params.append('q', query);
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        
        // If searching, use search endpoint
        if (query || startDate || endDate) {
             url += `/search`;
        }
        
        url += `?${params.toString()}`;

        try {
            isLoading = true;
            const response = await fetch(url);
            const data = await response.json();
            const newEvents = data.events || [];
            const total = data.total || 0;
            totalDatabaseCount = data.totalDatabaseCount || 0;
            
            if (reset) {
                allEvents = newEvents;
            } else {
                allEvents = [...allEvents, ...newEvents];
            }

            if (currentView === 'list') {
                renderEvents(allEvents);
                updateEventCounts(allEvents.length, total);
                
                // Setup infinite scroll if we have more events
                if (allEvents.length < total) {
                    setupInfiniteScroll();
                } else if (observer) {
                    observer.disconnect();
                }
            } else {
                renderCalendar();
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            showToast('Failed to load events', 'error');
        } finally {
            isLoading = false;
        }
    }

    function updateEventCounts(current, total) {
        const countsEl = document.getElementById('eventCounts');
        if (countsEl) {
            countsEl.innerHTML = `<p style="margin: 1rem 0; color: var(--text-secondary); font-size: 0.9rem;">Showing <strong>${current}</strong> of <strong>${total}</strong> events</p>`;
        }
    }

    function setupInfiniteScroll() {
        if (observer) observer.disconnect();

        const sentinel = document.createElement('div');
        sentinel.id = 'scrollSentinel';
        sentinel.style.height = '20px';
        sentinel.style.margin = '1rem 0';
        eventList.appendChild(sentinel);

        observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoading) {
                currentPage++;
                fetchEvents(false);
            }
        }, { rootMargin: '100px' });

        observer.observe(sentinel);
    }

    // Render events to DOM (List View)
    function renderEvents(events) {
        eventList.innerHTML = '';
        if (events.length === 0) {
            if (totalDatabaseCount > 0) {
                // Empty search results
                eventList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i class="ph ph-magnifying-glass"></i></div>
                        <h3>No Items Found</h3>
                        <p>Database contains <strong>${totalDatabaseCount}</strong> entries.</p>
                        <button class="btn-secondary" onclick="document.getElementById('clearSearchBtn').click()">Clear Search</button>
                    </div>
                `;
            } else {
                // Empty database
                eventList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i class="ph ph-calendar-x"></i></div>
                        <h3>No Events Found</h3>
                        <p>Your calendar is looking a bit empty. Why not add some events?</p>
                        <button class="btn-primary" onclick="document.getElementById('headerAddEventBtn').click()">Create Event</button>
                    </div>
                `;
            }
            return;
        }

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            const parseDate = (dateObj) => {
                if (!dateObj) return null;
                return new Date(dateObj.dateTime);
            };
            const startDateObj = parseDate(event.startDate);
            const endDateObj = parseDate(event.endDate);
            const startDate = startDateObj.toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
                hour12: timeFormat === '12h'
            });
            const endDate = endDateObj ? endDateObj.toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
                hour12: timeFormat === '12h'
            }) : '';
            const dateStr = event.isAllDay 
                ? `${startDateObj.toLocaleDateString(undefined, { dateStyle: 'medium' })} <span class="badge badge-info">All Day</span>`
                : (endDate ? `${startDate} - ${endDate}` : startDate);

            card.innerHTML = `
                <div class="event-info">
                    <h3>${escapeHtml(event.summary)}</h3>
                    <div class="event-meta">
                        <span>${event.isRecurring ? '<i class="ph ph-arrows-clockwise"></i>' : '<i class="ph ph-calendar-blank"></i>'} ${dateStr}</span>
                        ${event.location ? `<span><i class="ph ph-map-pin"></i> ${escapeHtml(event.location)}</span>` : ''}
                        ${event.recurrence ? `<span><i class="ph ph-repeat"></i> ${escapeHtml(event.recurrence)}</span>` : ''}
                    </div>
                    ${event.description ? `<p class="event-desc">${escapeHtml(event.description)}</p>` : ''}
                </div>
                <div class="event-actions">
                    <button class="btn-view" aria-label="View raw event"><i class="ph ph-code"></i></button>
                    <button class="btn-edit" aria-label="Edit event"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-delete" data-uid="${event.uid}" aria-label="Delete event"><i class="ph ph-trash"></i></button>
                </div>
            `;
            const editBtn = card.querySelector('.btn-edit');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(event);
            });
            const viewBtn = card.querySelector('.btn-view');
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                rawEventContent.textContent = event.raw;
                viewEventModal.classList.add('active');
            });
            card.addEventListener('click', () => openModal(event));
            eventList.appendChild(card);
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Fix: Use currentTarget to get the button element, not the icon
                const uid = e.currentTarget.dataset.uid;
                openDeleteModal(uid);
            });
        });
    }

    // Render Calendar View (jcalendar.js)
    function renderCalendar() {
        const calendarEl = document.getElementById('calendar');
        // Clear previous calendar instance if any (by clearing DOM)
        // Note: jcalendar.js might attach event listeners to window/document, 
        // but without a destroy method, clearing DOM is the best we can do to reset the view.
        calendarEl.innerHTML = ''; 

        const options = {
            manualEditingEnabled: false,
            theme: "glass",
            primaryColor: "#4f46e5",
            headerBackgroundColor: "#4f46e5",
            weekdayType: "long-upper",
            monthDisplayType: "long",
            events: {
                onEventClick: (event) => {
                    // event is the internal event object. We hope it preserves our 'id' property.
                    const originalEvent = allEvents.find(e => e.uid === event.id);
                    if (originalEvent) {
                        openModal(originalEvent);
                    }
                }
            }
        };

        // Initialize calendar
        calendarInstance = new calendarJs("calendar", options);
        
        // Add events
        allEvents.forEach(event => {
            const start = new Date(event.startDate.dateTime);
            const end = event.endDate ? new Date(event.endDate.dateTime) : new Date(start.getTime() + 60 * 60 * 1000);
            
            const calendarEvent = {
                id: event.uid,
                title: event.summary,
                from: start,
                to: end,
                location: event.location,
                description: event.description,
                color: event.isRecurring ? "#db2777" : "#4f46e5"
            };
            
            calendarInstance.addEvent(calendarEvent);
        });
    }

    // View Toggle Logic
    listViewBtn.addEventListener('click', () => {
        if (currentView === 'list') return;
        currentView = 'list';
        localStorage.setItem('currentView', 'list');
        listViewBtn.classList.add('active');
        calendarViewBtn.classList.remove('active');
        listViewSection.style.display = 'block';
        calendarViewSection.style.display = 'none';
        updateSearchVisibility();
        renderEvents(allEvents);
    });

    calendarViewBtn.addEventListener('click', () => {
        if (currentView !== 'list') return;
        currentView = 'month'; // jcalendar handles views internally mostly, but we treat it as one view
        localStorage.setItem('currentView', 'month');
        calendarViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        calendarViewSection.style.display = 'block';
        listViewSection.style.display = 'none';
        updateSearchVisibility();
        renderCalendar();
    });

    // Add/Edit event
    const errorOverlay = document.getElementById('errorOverlay');
    const errorMessageEl = document.getElementById('errorMessage');
    const closeErrorBtn = document.getElementById('closeErrorBtn');
    const dismissErrorBtn = document.getElementById('dismissErrorBtn');

    function showError(message) {
        errorMessageEl.textContent = message;
        errorOverlay.classList.add('active');
    }

    function closeError() {
        errorOverlay.classList.remove('active');
    }

    closeErrorBtn.addEventListener('click', closeError);
    dismissErrorBtn.addEventListener('click', closeError);
    errorOverlay.addEventListener('click', (e) => {
        if (e.target === errorOverlay) closeError();
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
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate') || null,
            rrule: formData.get('rrule') || null
        };

        try {
            let response;
            if (uid) {
                response = await fetch(`/api/events/${uid}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData)
                });
            } else {
                response = await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData)
                });
            }

            if (response.ok) {
                closeModal();
                showToast(uid ? 'Event updated successfully' : 'Event added successfully');
                fetchEvents();
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.error || (uid ? 'Failed to update event' : 'Failed to add event');
                showError(errorMessage);
                console.error('Server error:', errorMessage);
            }
        } catch (error) {
            console.error('Error saving event:', error);
            showError(`Error saving event: ${error.message}`);
        }
    });

    // Delete event
    async function deleteEvent(uid) {
        try {
            const response = await fetch(`/api/events/${uid}`, { method: 'DELETE' });
            if (response.ok) {
                showToast('Event deleted successfully');
                if (currentView === 'list') {
                    const btn = document.querySelector(`.btn-delete[data-uid="${uid}"]`);
                    if (btn) {
                        const card = btn.closest('.event-card');
                        card.style.opacity = '0';
                        card.style.transform = 'translateX(20px)';
                        setTimeout(() => fetchEvents(), 300);
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
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    const handleSearch = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => fetchEvents(), 300);
        
        // Toggle clear button visibility
        if (searchInput.value.length > 0) {
            clearSearchBtn.style.display = 'flex';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    };
    searchInput.addEventListener('input', handleSearch);
    
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        fetchEvents();
        searchInput.focus();
    });
    startDateFilter.addEventListener('change', handleSearch);
    endDateFilter.addEventListener('change', handleSearch);

    function updateSearchVisibility() {
        if (currentView === 'list') {
            searchContainer.style.display = 'flex';
        } else {
            searchContainer.style.display = 'none';
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // Initial load
    if (currentView === 'list') {
        listViewBtn.classList.add('active');
        calendarViewBtn.classList.remove('active');
        listViewSection.style.display = 'block';
        calendarViewSection.style.display = 'none';
    } else {
        listViewBtn.classList.remove('active');
        calendarViewBtn.classList.add('active');
        listViewSection.style.display = 'none';
        calendarViewSection.style.display = 'block';
    }
    updateSearchVisibility();
    fetchEvents();
});
