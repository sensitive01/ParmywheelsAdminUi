'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, updateSession } from 'next-auth/react'
import { Button, Card, CardContent, Typography, Alert, TextField, MenuItem, InputAdornment, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid2';

const API_URL = process.env.NEXT_PUBLIC_API_URL 

const EmployeeProfile = () => {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  
  // Form State
  const [employeeName, setEmployeeName] = useState('')
  const [employeeEmail, setEmployeeEmail] = useState('')
  const [employeeMobile, setEmployeeMobile] = useState('')
  const [employeePassword, setEmployeePassword] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  
  // Read-only State
  const [designation, setDesignation] = useState('')
  const [salary, setSalary] = useState('')
  const [joiningDate, setJoiningDate] = useState('')
  const [status, setStatus] = useState('')
  const [attendance, setAttendance] = useState('')
  const [leaves, setLeaves] = useState('')

  const [employeeData, setEmployeeData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchEmployeeData = async () => {
      try {
        setIsLoading(true);
        const endpoint = `${API_URL}/admin/employee/${session.user.id}`;
          
        const response = await fetch(endpoint, {
          headers: {
            ...(session?.accessToken && { 'Authorization': `Bearer ${session.accessToken}` })
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setEmployeeData(data);
        
        setEmployeeName(data.userName || data.adminName || '');
        setEmployeeEmail(data.userEmail || '');
        setEmployeeMobile(data.userMobile || '');
        setDob(data.dob || '');
        setGender(data.gender || '');
        
        setDesignation(data.designation || '');
        setSalary(data.salary || '');
        setJoiningDate(data.joiningDate || '');
        setStatus(data.status || '');
        setAttendance(data.attendance || 0);
        setLeaves(data.leaves || 0);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      if (!employeeName.trim()) throw new Error('Name is required');
      if (!employeeMobile.trim()) throw new Error('Mobile is required');
      
      const endpoint = `${API_URL}/admin/employee/${session.user.id}`;
      const payload = {
        userName: employeeName.trim(),
        userEmail: employeeEmail.trim(),
        userMobile: employeeMobile.trim(),
        dob: dob,
        gender: gender,
      };
      
      if (employeePassword.trim()) {
        payload.userPassword = employeePassword.trim();
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.accessToken && { 'Authorization': `Bearer ${session.accessToken}` })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Update failed with status ${response.status}`);
      }
      
      // Update session with new data
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: employeeName.trim()
        }
      });

      setEmployeePassword(''); // Clear password field after successful update
      alert('Profile updated successfully!');
      router.refresh();
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !employeeData) {
    return <Typography>Loading data...</Typography>;
  }

  return (
    <Card component="form" onSubmit={handleSubmit}>
      <CardContent>
        <Typography variant="h4" align="center" gutterBottom>
          Update Profile
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Name"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              required
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={employeeEmail}
              onChange={(e) => setEmployeeEmail(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Mobile Number"
              value={employeeMobile}
              onChange={(e) => setEmployeeMobile(e.target.value)}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={employeePassword}
              onChange={(e) => setEmployeePassword(e.target.value)}
              placeholder="Leave blank to keep current"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      <i className={showPassword ? 'ri-eye-line' : 'ri-eye-off-line'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>


          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Update Details'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EmployeeProfile;
