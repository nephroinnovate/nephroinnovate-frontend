import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import UpgradePlanCard from './UpgradePlanCard';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useConfig from 'hooks/useConfig';
import authApi from 'api/auth';
import usersApi from 'api/users';
import uploadsApi from 'api/uploads';

// assets
import User1 from 'assets/images/users/user-round.svg';
import { IconLogout, IconSearch, IconSettings, IconUser } from '@tabler/icons-react';

// ==============================|| PROFILE MENU ||============================== //

export default function ProfileSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { borderRadius } = useConfig();
  const [sdm, setSdm] = useState(true);
  const [value, setValue] = useState('');
  const [notification, setNotification] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user information
  const userRole = localStorage.getItem('userRole') || 'Guest';

  // Helper function to get avatar URL
  const getAvatarUrl = () => {
    if (!userProfile?.avatar) return User1;
    // Check if it's a full URL or just a filename
    if (userProfile.avatar.startsWith('http')) {
      return userProfile.avatar;
    }
    // Construct the full URL for the avatar
    return `${uploadsApi.API_BASE_URL}/media/${userProfile.avatar}`;
  };

  // Load user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await usersApi.getCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authApi.isAuthenticated()) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // Generate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Handle account settings navigation
  const handleAccountSettings = () => {
    navigate('/account/settings');
    setOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    // Use the existing auth API logout function
    authApi.logout();

    // Close the profile dropdown
    setOpen(false);

    // Redirect to home page
    navigate('/');
  };

  /**
   * anchorRef is used on different components and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);

    if (index === 0) {
      handleAccountSettings();
    } else if (index === 2) {
      handleLogout();
    }
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Chip
        sx={{
          ml: 2,
          height: '48px',
          alignItems: 'center',
          borderRadius: '27px',
          '& .MuiChip-label': {
            lineHeight: 0
          }
        }}
        icon={
          <Avatar
            src={getAvatarUrl()}
            alt="user-images"
            sx={{
              ...theme.typography.mediumAvatar,
              margin: '8px 0 8px 8px !important',
              cursor: 'pointer'
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            color="inherit"
          />
        }
        label={<IconSettings stroke={1.5} size="24px" />}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="primary"
        aria-label="user-account"
      />
      <Popper
        placement="bottom"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 14]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                    <Box sx={{ p: 2, pb: 0 }}>
                      <Stack>
                        {loading ? (
                          <CircularProgress size={24} sx={{ my: 1 }} />
                        ) : (
                          <>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                              <Typography variant="h4">{getGreeting()},</Typography>
                              <Typography component="span" variant="h4" sx={{ fontWeight: 400 }}>
                                {userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : 'User'}
                              </Typography>
                            </Stack>
                            <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                              {userRole}
                            </Typography>
                          </>
                        )}
                      </Stack>
                      <OutlinedInput
                        sx={{ width: '100%', pr: 1, pl: 2, my: 2 }}
                        id="input-search-profile"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Search profile options"
                        startAdornment={
                          <InputAdornment position="start">
                            <IconSearch stroke={1.5} size="16px" />
                          </InputAdornment>
                        }
                        aria-describedby="search-helper-text"
                        inputProps={{
                          'aria-label': 'weight'
                        }}
                      />
                      <Divider />
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        py: 0,
                        height: '100%',
                        maxHeight: 'calc(100vh - 250px)',
                        overflowX: 'hidden',
                        '&::-webkit-scrollbar': { width: 5 }
                      }}
                    >
                      <UpgradePlanCard />
                      <Divider />
                      <Card sx={{ bgcolor: 'primary.light', my: 2 }}>
                        <CardContent>
                          <Grid container spacing={3} direction="column">
                            <Grid>
                              <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                <Grid>
                                  <Typography variant="subtitle1">Start DND Mode</Typography>
                                </Grid>
                                <Grid>
                                  <Switch
                                    color="primary"
                                    checked={sdm}
                                    onChange={(e) => setSdm(e.target.checked)}
                                    name="sdm"
                                    size="small"
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                            <Grid>
                              <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                <Grid>
                                  <Typography variant="subtitle1">Allow Notifications</Typography>
                                </Grid>
                                <Grid>
                                  <Switch
                                    checked={notification}
                                    onChange={(e) => setNotification(e.target.checked)}
                                    name="sdm"
                                    size="small"
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                      <Divider />
                      <List
                        component="nav"
                        sx={{
                          width: '100%',
                          maxWidth: 350,
                          minWidth: 300,
                          borderRadius: `${borderRadius}px`,
                          '& .MuiListItemButton-root': { mt: 0.5 }
                        }}
                      >
                        <ListItemButton
                          sx={{ borderRadius: `${borderRadius}px` }}
                          selected={selectedIndex === 0}
                          onClick={(event) => handleListItemClick(event, 0)}
                        >
                          <ListItemIcon>
                            <IconSettings stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Account Settings</Typography>} />
                        </ListItemButton>
                        <ListItemButton
                          sx={{ borderRadius: `${borderRadius}px` }}
                          selected={selectedIndex === 1}
                          onClick={(event) => handleListItemClick(event, 1)}
                        >
                          <ListItemIcon>
                            <IconUser stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Grid container spacing={1} sx={{ justifyContent: 'space-between' }}>
                                <Grid>
                                  <Typography variant="body2">Social Profile</Typography>
                                </Grid>
                                <Grid>
                                  <Chip
                                    label="02"
                                    variant="filled"
                                    size="small"
                                    color="warning"
                                    sx={{ '& .MuiChip-label': { mt: 0.25 } }}
                                  />
                                </Grid>
                              </Grid>
                            }
                          />
                        </ListItemButton>
                        <ListItemButton
                          sx={{ borderRadius: `${borderRadius}px` }}
                          selected={selectedIndex === 2}
                          onClick={(event) => handleListItemClick(event, 2)}
                        >
                          <ListItemIcon>
                            <IconLogout stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
                        </ListItemButton>
                      </List>
                    </Box>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
