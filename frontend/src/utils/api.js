import axios from 'axios';
import { API_URL } from '../context/AuthContext';

// Add default base URL to axios
axios.defaults.baseURL = API_URL;

export const api = {
  // Fetch user roadmaps
  async fetchRoadmaps() {
    const response = await axios.get('/roadmaps');
    return response.data;
  },

  // Fetch specific roadmap details
  async fetchRoadmapDetails(id) {
    const response = await axios.get(`/roadmap/${id}`);
    return response.data;
  },

  // Generate new roadmap (supports resume PDF upload via FormData)
  async generateRoadmap(dreamJob, currentSkills, experienceLevel, file = null) {
    const formData = new FormData();
    formData.append('dream_job', dreamJob);
    formData.append('current_skills', currentSkills || '');
    formData.append('experience_level', experienceLevel);
    if (file) {
      formData.append('file', file);
    }

    const response = await axios.post('/generate-roadmap', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update learning progress for a specific week
  async updateRoadmapProgress(roadmapId, weekNumber, completed) {
    const response = await axios.post('/update-progress', {
      roadmap_id: roadmapId,
      week_number: weekNumber,
      completed: completed
    });
    return response.data;
  },

  // Generate PDF download URL
  getPdfDownloadUrl(id) {
    const token = localStorage.getItem('token');
    return `${API_URL}/roadmap/${id}/pdf?token=${token}`; // Alternatively, download with Axios blob stream
  },

  // Axios blob-based PDF download (more robust JWT transmission)
  async downloadPdfBlob(id, dreamJob) {
    const response = await axios.get(`/roadmap/${id}/pdf`, {
      responseType: 'blob'
    });
    
    // Create a temporary link element to trigger browser download dialog
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const cleanJobName = dreamJob.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    link.setAttribute('download', `roadmap_${cleanJobName}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
