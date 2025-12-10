import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TeamCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchAllLeaves = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/leaves', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const leaveEvents = res.data.map(leave => ({
          title: `${leave.userId.name} - ${leave.leaveType}`,
          start: leave.startDate,
          end: new Date(new Date(leave.endDate).setDate(new Date(leave.endDate).getDate() + 1)),
          backgroundColor: leave.status === 'Approved' ? '#10b981' : '#f59e0b',
          borderColor: leave.status === 'Approved' ? '#10b981' : '#f59e0b'
        }));
        setEvents(leaveEvents);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllLeaves();
  }, []);

  return (
    <div className="card bg-base-100 shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Team Leave Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
      />
    </div>
  );
}