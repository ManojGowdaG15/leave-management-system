import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { Modal, Button, Badge, Alert } from 'react-bootstrap';

const localizer = momentLocalizer(moment);

const TeamCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchTeamCalendar();
    }, []);

    const fetchTeamCalendar = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/manager/team-calendar', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load calendar data');
            setLoading(false);
        }
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Pending': 'warning',
            'Approved': 'success',
            'Rejected': 'danger',
            'Cancelled': 'secondary'
        };
        return <Badge bg={variants[status]}>{status}</Badge>;
    };

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0',
                display: 'block'
            }
        };
    };

    if (loading) return <div className="text-center"><div className="spinner-border"></div></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">Team Leave Calendar</h4>
                </div>
                <div className="card-body">
                    <div className="mb-4">
                        <div className="d-flex flex-wrap gap-3">
                            <div className="d-flex align-items-center">
                                <div className="color-box" style={{ backgroundColor: '#4ECDC4', width: '20px', height: '20px', marginRight: '8px' }}></div>
                                <span>Approved Casual Leave</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="color-box" style={{ backgroundColor: '#45B7D1', width: '20px', height: '20px', marginRight: '8px' }}></div>
                                <span>Approved Sick Leave</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="color-box" style={{ backgroundColor: '#96CEB4', width: '20px', height: '20px', marginRight: '8px' }}></div>
                                <span>Approved Earned Leave</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="color-box" style={{ backgroundColor: '#FF6B6B', width: '20px', height: '20px', marginRight: '8px' }}></div>
                                <span>Pending Leave</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '700px' }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            onSelectEvent={handleSelectEvent}
                            eventPropGetter={eventStyleGetter}
                            popup
                            tooltipAccessor={(event) => `${event.title} (${event.extendedProps.status})`}
                        />
                    </div>
                </div>
            </div>

            {/* Event Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Leave Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEvent && (
                        <div>
                            <p><strong>Employee:</strong> {selectedEvent.extendedProps.userName}</p>
                            <p><strong>Leave Type:</strong> {selectedEvent.extendedProps.leaveType}</p>
                            <p><strong>Dates:</strong> {moment(selectedEvent.start).format('MMM D, YYYY')} to {moment(selectedEvent.end).format('MMM D, YYYY')}</p>
                            <p><strong>Status:</strong> {getStatusBadge(selectedEvent.extendedProps.status)}</p>
                            <p><strong>Reason:</strong> {selectedEvent.extendedProps.reason || 'N/A'}</p>
                            {selectedEvent.extendedProps.comments && (
                                <p><strong>Manager Comments:</strong> {selectedEvent.extendedProps.comments}</p>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TeamCalendar;