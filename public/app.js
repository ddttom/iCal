document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('eventList');
    const searchInput = document.getElementById('searchInput');
    const addEventForm = document.getElementById('addEventForm');

    // Fetch and display events
    async function fetchEvents(query = '') {
        let url = '/api/events';
        if (query) {
            url += `/search?q=${encodeURIComponent(query)}`;
        }

        try {
            const response = await fetch(url);
            const events = await response.json();
            renderEvents(events);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    // Render events to DOM
    function renderEvents(events) {
        eventList.innerHTML = '';
        if (events.length === 0) {
            eventList.innerHTML = '<p class="text-muted">No events found.</p>';
            return;
        }

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            
            const startDate = new Date(event.startDate).toLocaleString();
            const endDate = event.endDate ? new Date(event.endDate).toLocaleString() : '';
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
                <button class="btn-delete" data-uid="${event.uid}">Delete</button>
            `;
            eventList.appendChild(card);
        });

        // Add delete listeners
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const uid = e.target.dataset.uid;
                if (confirm('Are you sure you want to delete this event?')) {
                    await deleteEvent(uid);
                }
            });
        });
    }

    // Add new event
    addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addEventForm);
        const eventData = {
            summary: formData.get('summary'),
            description: formData.get('description'),
            location: formData.get('location'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate') || null
        };

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                addEventForm.reset();
                fetchEvents();
            } else {
                alert('Failed to add event');
            }
        } catch (error) {
            console.error('Error adding event:', error);
        }
    });

    // Delete event
    async function deleteEvent(uid) {
        try {
            const response = await fetch(`/api/events/${uid}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchEvents(searchInput.value);
            } else {
                alert('Failed to delete event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    }

    // Search functionality
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchEvents(e.target.value);
        }, 300);
    });

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
