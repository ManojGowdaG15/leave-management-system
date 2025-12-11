import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, Filter } from 'lucide-react';
import { managerAPI } from '../../services/api';
import Loader from '../common/Loader';
import { toast } from 'react-hot-toast';

const TeamCalendar = () => {
  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchTeamCalendar();
  }, []);

  const fetchTeamCalendar = async () => {
    try {
      const response = await managerAPI.getTeamCalendar();
      setCalendarData(response.data.data.leaves);
    } catch (error) {
      toast.error('Failed to load team calendar');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    return { firstDayOfWeek, daysInMonth };
  };

  const getMonthYearString = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getEventsForDay = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    return calendarData.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      eventEnd.setHours(23, 59, 59, 999); // Include entire end day
      
      // Check if date is within event range
      const isInRange = date >= eventStart && date <= eventEnd;
      
      // Apply filters
      const employeeMatch = selectedEmployee === 'all' || event.employee === selectedEmployee;
      const typeMatch = selectedType === 'all' || event.type === selectedType;
      
      return isInRange && employeeMatch && typeMatch;
    });
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'casual': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sick': return 'bg-red-100 text-red-800 border-red-200';
      case 'earned': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUniqueEmployees = () => {
    const employees = calendarData.map(event => event.employee);
    return ['all', ...new Set(employees)];
  };

  const getUniqueTypes = () => {
    const types = calendarData.map(event => event.type);
    return ['all', ...new Set(types)];
  };

  const { firstDayOfWeek, daysInMonth } = getDaysInMonth(currentDate);
  const employees = getUniqueEmployees();
  const types = getUniqueTypes();

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Calendar</h1>
          <p className="text-gray-600">View team leaves and time-off schedule</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-primary">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Add Team Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="input"
            >
              {employees.map(emp => (
                <option key={emp} value={emp}>
                  {emp === 'all' ? 'All Employees' : emp}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Leave Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : `${type.charAt(0).toUpperCase() + type.slice(1)} Leave`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-medium text-gray-900">
                {getMonthYearString(currentDate)}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 text-center font-medium text-gray-900">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before the first day of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[120px] border-r border-b border-gray-200 p-2 bg-gray-50"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const events = getEventsForDay(day);
            const isToday = new Date().getDate() === day && 
                           new Date().getMonth() === currentDate.getMonth() && 
                           new Date().getFullYear() === currentDate.getFullYear();

            return (
              <div 
                key={day} 
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {day}
                  </span>
                  {events.length > 0 && (
                    <span className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-1">
                      {events.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 max-h-[80px] overflow-y-auto">
                  {events.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`text-xs px-2 py-1 rounded border ${getEventColor(event.type)} truncate`}
                      title={`${event.employee} - ${event.type} Leave`}
                    >
                      <span className="font-medium">{event.employee.split(' ')[0]}</span>
                      <span className="ml-1 text-xs opacity-75">
                        {event.type.charAt(0)}
                      </span>
                    </div>
                  ))}
                  
                  {events.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Casual Leave</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Sick Leave</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Earned Leave</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-50 border border-blue-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Today</span>
          </div>
        </div>
      </div>

      {/* Upcoming Leaves */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Team Leaves</h3>
        <div className="space-y-3">
          {calendarData
            .filter(event => new Date(event.start) >= new Date())
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 5)
            .map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getEventColor(event.type)}`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.employee}</p>
                    <p className="text-sm text-gray-600 capitalize">{event.type} Leave</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {new Date(event.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                    {new Date(event.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {Math.ceil((new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60 * 24)) + 1} days
                  </p>
                </div>
              </div>
            ))}
          
          {calendarData.filter(event => new Date(event.start) >= new Date()).length === 0 && (
            <p className="text-gray-500 text-center py-4">No upcoming leaves scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;