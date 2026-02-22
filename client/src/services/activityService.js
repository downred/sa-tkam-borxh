import api from './api';

export const activityService = {
  // Get activities for a group
  async getGroupActivities(groupId, { limit = 50, before } = {}) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (before) params.append('before', before);
    
    const queryString = params.toString();
    const url = `/activities/groups/${groupId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  }
};

export default activityService;
