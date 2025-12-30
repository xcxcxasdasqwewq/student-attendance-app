import React, { useState, useEffect } from 'react';
import api from '../api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    phone: '',
    course: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('❌ Error fetching students. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/api/students/${editingStudent.student_id}`, formData);
      } else {
        await api.post('/api/students', formData);
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ student_id: '', name: '', email: '', phone: '', course: '' });
      fetchStudents();
      alert('✅ Student saved successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error saving student';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      course: student.course || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student? This will also delete all their attendance records.')) {
      try {
        await api.delete(`/api/students/${studentId}`);
        fetchStudents();
        alert('✅ Student deleted successfully!');
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Error deleting student';
        alert(`❌ ${errorMsg}`);
      }
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ student_id: '', name: '', email: '', phone: '', course: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading students...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#333' }}>👥 Students Management</h1>
          <button className="btn btn-primary" onClick={openAddModal}>
            ➕ Add Student
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.student_id}</td>
                  <td>{student.name}</td>
                  <td>{student.email || '-'}</td>
                  <td>{student.phone || '-'}</td>
                  <td>{student.course || '-'}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(student)}
                      style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(student.student_id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Student ID *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                  disabled={!!editingStudent}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStudent ? 'Update' : 'Add'} Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;

