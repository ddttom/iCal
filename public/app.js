document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('eventList');
    const searchInput = document.getElementById('searchInput');
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');
    const addEventForm = document.getElementById('addEventForm');
    const modalTitle = document.querySelector('.modal-header h2');
    const submitBtn = addEventForm.querySelector('button[type="submit"]');
    const eventUidInput = document.getElementById('eventUid');
    const addEventModal = document.getElementById('addEventModal');
    const fabAddEvent = document.getElementById('fabAddEvent');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const toastContainer = document.getElementById('toastContainer');

    // Modal Logic
    function openModal(event = null) {
        if (event) {
            // Edit Mode
            modalTitle.textContent = 'Edit Event';
            submitBtn.textContent = 'Save Changes';
            eventUidInput.value = event.uid;
            
            document.getElementById('summary').value = event.summary;
            document.getElementById('description').value = event.description || '';
            document.getElementById('location').value = event.location || '';
            
            // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                    .toISOString()
                    .slice(0, 16);
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
        }
        
        addEventModal.classList.add('active');
        document.getElementById('summary').focus();
    }

    function closeModal() {
        addEventModal.classList.remove('active');
        addEventForm.reset();
        eventUidInput.value = '';
    }

    fabAddEvent.addEventListener('click', () => openModal(null));
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    addEventModal.addEventListener('click', (e) => {
        if (e.target === addEventModal) {
            closeModal();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && addEventModal.classList.contains('active')) {
            closeModal();
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
            const events = await response.json();
            renderEvents(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            showToast('Failed to load events', 'error');
        }
    }

    // Render events to DOM
    function renderEvents(events) {
        eventList.innerHTML = '';
        if (events.length === 0) {
            eventList.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
                    <p>No events found. Click the + button to add one!</p>
                </div>
            `;
            return;
        }

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            
            const startDate = new Date(event.startDate).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
            
            const endDate = event.endDate ? new Date(event.endDate).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
            }) : '';
            
            const dateStr = endDate ? `${startDate} - ${endDate}` : startDate;

            card.innerHTML = `
                <div class="event-info">
                    <h3>${escapeHtml(event.summary)}</h3>
                    <div class="event-meta">
                        <span>📅 ${dateStr}</span>
                        ${event.location ? `<span>📍 ${escapeHtml(event.location)}</span>` : ''}
                    </div>
                    ${event.description ? `<p class="event-desc">${escapeHtml(event.description)}</p>` : ''}
                </div>
                <div class="event-actions">
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
            endDate: formData.get('endDate') || null
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
                fetchEvents(searchInput.value);
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
                const btn = document.querySelector(`.btn-delete[data-uid="${uid}"]`);
                if (btn) {
                    const card = btn.closest('.event-card');
                    card.style.opacity = '0';
                    card.style.transform = 'translateX(20px)';
                    setTimeout(() => {
                        fetchEvents(searchInput.value);
                    }, 300);
                } else {
                    fetchEvents(searchInput.value);
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

    // Initial load
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
