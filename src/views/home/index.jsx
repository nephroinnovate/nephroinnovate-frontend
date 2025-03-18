import { motion } from 'framer-motion';
import { Box as ScrollBox } from 'react-scroll';
import {
  IconChevronDown,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconHeartbeat,
  IconCalendarEvent,
  IconNurse,
  IconReportMedical,
  IconMessage,
  IconUserCircle,
  IconArrowRight
} from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import {
  AppBar,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Logo from 'ui-component/Logo';
import dialysisIllustration from 'assets/images/dialysis-illustration.svg';

// Custom Accordion Divider
const AccordionDivider = () => (
  <Divider sx={{ borderColor: 'divider' }} />
);

// ==============================|| HOME PAGE ||============================== //

const HomePage = () => {
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Modern Sticky Header with scroll effect */}
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          bgcolor: scrolled ? 'background.paper' : 'rgba(255, 255, 255, 0.9)',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          borderBottom: scrolled ? `1px solid ${theme.palette.divider}` : '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Logo />
            <Stack direction="row" spacing={2}>
              <Button
                variant="text"
                color={scrolled ? "primary" : "inherit"}
                component={RouterLink}
                to="/pages/login"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: scrolled ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.87)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.3s ease'
                  }
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/pages/register"
                sx={{
                  borderRadius: '24px',
                  px: 3,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                Register
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Modernized Hero Section with Gradient and Animation */}
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        sx={{
          pt: 16,
          pb: 10,
          background: `linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #673ab7 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decorative elements */}
        <Box sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          top: '-200px',
          right: '-100px',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          bottom: '-100px',
          left: '10%',
          zIndex: 0
        }} />

        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} component={motion.div} variants={fadeInUp}>
              <Typography
                variant="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  mb: 2
                }}
              >
                Welcome to <Box component="span" sx={{ color: theme.palette.secondary.light }}>DialysisHub</Box>
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mb: 4,
                  fontWeight: 'normal',
                  opacity: 0.9,
                  lineHeight: 1.4
                }}
                component={motion.div}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.2 }
                  }
                }}
              >
                A comprehensive platform enhancing communication and coordination between dialysis patients and healthcare providers.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                component={motion.div}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { delay: 0.4 }
                  }
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/dashboard/default"
                  sx={{
                    borderRadius: '30px',
                    px: 4,
                    py: 1.5,
                    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 25px rgba(0,0,0,0.25)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    borderRadius: '30px',
                    px: 4,
                    py: 1.5,
                    backdropFilter: 'blur(5px)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-5px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                  size="large"
                  component={RouterLink}
                  to="/pages/login"
                >
                  Sign In
                </Button>
              </Stack>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              component={motion.div}
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: {
                    delay: 0.3,
                    type: "spring",
                    stiffness: 100
                  }
                }
              }}
            >
              <Box
                component="img"
                src={dialysisIllustration}
                alt="Dialysis Illustration"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  display: 'block',
                  mx: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  transform: 'perspective(1000px) rotateY(-5deg)',
                  transition: 'all 0.5s ease',
                  '&:hover': {
                    transform: 'perspective(1000px) rotateY(0deg) translateY(-10px)',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
                  }
                }}
              />
            </Grid>
          </Grid>

          {/* Scroll indicator */}
          <Box
            sx={{
              textAlign: 'center',
              mt: 8,
              cursor: 'pointer',
              animation: 'bounce 2s infinite'
            }}
            component={ScrollBox}
            to="features"
            smooth={true}
            duration={800}
          >
            <IconChevronDown
              size={32}
              style={{
                opacity: 0.8,
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(10px)' }
                }
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        sx={{
          py: 6,
          backgroundImage: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.background.default})`
        }}
      >
        <Container>
          <Grid container spacing={2} justifyContent="center">
            {[
              { number: "10,000+", label: "Active Users" },
              { number: "500+", label: "Healthcare Providers" },
              { number: "98%", label: "Patient Satisfaction" },
              { number: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 800,
                        color: theme.palette.primary.main,
                        mb: 1
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section with modern cards */}
      <Box id="features" sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            sx={{ mb: 8, textAlign: 'center' }}
          >
            <Typography
              variant="overline"
              component="p"
              color="primary"
              sx={{ fontWeight: 'bold', mb: 1, letterSpacing: 2 }}
            >
              WHY CHOOSE US
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                position: 'relative',
                display: 'inline-block',
                pb: 2,
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: '80px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: theme.palette.primary.main,
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              Features & Benefits
            </Typography>
            <Typography
              variant="h5"
              color="textSecondary"
              sx={{
                maxWidth: '700px',
                mx: 'auto',
                mt: 2,
                fontWeight: 400
              }}
            >
              DialysisHub integrates multiple aspects of kidney care to improve patient outcomes and quality of life.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Feature items with animation */}
            {[
              {
                icon: <IconHeartbeat size={48} />,
                title: "Health Monitoring",
                description: "Track vital health metrics with real-time updates and alerts for critical changes."
              },
              {
                icon: <IconCalendarEvent size={48} />,
                title: "Appointment Management",
                description: "Schedule and manage dialysis appointments with ease and receive timely reminders."
              },
              {
                icon: <IconNurse size={48} />,
                title: "Provider Communication",
                description: "Direct messaging with your healthcare team for quick answers and continuous care."
              },
              {
                icon: <IconReportMedical size={48} />,
                title: "Medical Records",
                description: "Access your complete medical history and treatment plans in one secure location."
              },
              {
                icon: <IconMessage size={48} />,
                title: "Community Support",
                description: "Connect with others on similar journeys through moderated support groups."
              },
              {
                icon: <IconUserCircle size={48} />,
                title: "Personalized Care",
                description: "Receive tailored care recommendations based on your unique health profile."
              }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      border: `1px solid ${theme.palette.divider}`,
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                        '& .featureIcon': {
                          color: 'white',
                          backgroundColor: theme.palette.primary.main
                        }
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Box
                        className="featureIcon"
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: theme.palette.primary.light + '20',
                          color: theme.palette.primary.main,
                          mb: 3,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h3"
                        component="div"
                        sx={{
                          fontWeight: 600,
                          mb: 1.5
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
        <Container>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{ mb: 8, textAlign: 'center' }}
          >
            <Typography
              variant="overline"
              component="p"
              color="primary"
              sx={{ fontWeight: 'bold', mb: 1, letterSpacing: 2 }}
            >
              SIMPLE PROCESS
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              How DialysisHub Works
            </Typography>
            <Typography
              variant="h5"
              color="textSecondary"
              sx={{
                maxWidth: '700px',
                mx: 'auto',
                mt: 2
              }}
            >
              Get started with DialysisHub in three simple steps
            </Typography>
          </Box>

          <Box sx={{ position: 'relative' }}>
            {/* Connection line */}
            <Box sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              top: '100px',
              left: '50px',
              right: '50px',
              height: '4px',
              bgcolor: theme.palette.divider,
              zIndex: 1
            }} />

            <Grid container spacing={4} position="relative" zIndex={2}>
              {[
                {
                  step: "1",
                  title: "Create Your Account",
                  description: "Register and complete your health profile with relevant medical information.",
                  icon: <IconUserCircle size={40} />
                },
                {
                  step: "2",
                  title: "Connect With Providers",
                  description: "Link your account to your healthcare team for seamless communication.",
                  icon: <IconNurse size={40} />
                },
                {
                  step: "3",
                  title: "Manage Your Care",
                  description: "Schedule appointments, track health metrics, and communicate with your care team.",
                  icon: <IconHeartbeat size={40} />
                }
              ].map((item, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: theme.palette.background.default,
                        border: `4px solid ${theme.palette.primary.main}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        color: theme.palette.primary.main
                      }}>
                        {item.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 'bold',
                          mb: 1
                        }}
                      >
                        Step {item.step}
                      </Typography>
                      <Typography
                        variant="h4"
                        component="h3"
                        sx={{
                          mb: 2,
                          fontWeight: 'medium'
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Partners & Integrations Section */}
<Box sx={{ py: 8, bgcolor: 'background.paper' }}>
  <Container>
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      sx={{ mb: 6, textAlign: 'center' }}
    >
      <Typography
        variant="overline"
        component="p"
        color="primary"
        sx={{ fontWeight: 'bold', mb: 1, letterSpacing: 2 }}
      >
        TRUSTED ECOSYSTEM
      </Typography>
      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 700 }}
      >
        Partners & Integrations
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}
      >
        We've partnered with leading healthcare organizations and technology providers to create a seamless experience for patients and providers.
      </Typography>
    </Box>

    <Grid container spacing={4} alignItems="center" justifyContent="center">
      {[
        "https://via.placeholder.com/200x80?text=Hospital+Group",
        "https://via.placeholder.com/200x80?text=Health+Insurance",
        "https://via.placeholder.com/200x80?text=Medical+Systems",
        "https://via.placeholder.com/200x80?text=Tech+Partner",
        "https://via.placeholder.com/200x80?text=Research+Institute",
        "https://via.placeholder.com/200x80?text=University"
      ].map((logo, index) => (
        <Grid item xs={6} sm={4} md={2} key={index}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Box
              component="img"
              src={logo}
              alt={`Partner ${index + 1}`}
              sx={{
                width: '100%',
                height: 'auto',
                opacity: 0.7,
                transition: 'all 0.3s ease',
                filter: 'grayscale(100%)',
                '&:hover': {
                  opacity: 1,
                  filter: 'grayscale(0%)',
                  transform: 'scale(1.05)'
                }
              }}
            />
          </motion.div>
        </Grid>
      ))}
    </Grid>

    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      sx={{
        mt: 6,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}
    >
      <Typography variant="body1" color="text.secondary">
        Interested in becoming a partner?
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        endIcon={<IconArrowRight size={18} />}
        component={RouterLink}
        to="/partners"
        sx={{
          borderRadius: '30px',
          px: 3
        }}
      >
        Partner with us
      </Button>
    </Box>
  </Container>
</Box>


{/* Testimonials Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{ mb: 8, textAlign: 'center' }}
          >
            <Typography
              variant="overline"
              component="p"
              color="primary"
              sx={{ fontWeight: 'bold', mb: 1, letterSpacing: 2 }}
            >
              TESTIMONIALS
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                position: 'relative',
                display: 'inline-block',
                pb: 2,
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: '80px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: theme.palette.primary.main,
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              Patient Success Stories
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                name: "Sarah Johnson",
                role: "Patient since 2019",
                image: "https://randomuser.me/api/portraits/women/44.jpg",
                quote: "DialysisHub has made managing my treatments so much easier. I love being able to message my care team directly when I have questions."
              },
              {
                name: "Michael Chen",
                role: "Patient since 2020",
                image: "https://randomuser.me/api/portraits/men/32.jpg",
                quote: "The appointment scheduling feature saves me so much time, and the health tracking gives me peace of mind knowing my data is being monitored."
              },
              {
                name: "Dr. Lisa Patel",
                role: "Nephrologist",
                image: "https://randomuser.me/api/portraits/women/68.jpg",
                quote: "As a provider, DialysisHub has streamlined my patient communications and allows me to deliver more personalized care."
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ fontSize: '3rem', color: theme.palette.primary.main, mb: 2 }}>❝</Box>
                    <Typography variant="body1" paragraph sx={{ flexGrow: 1, fontStyle: 'italic' }}>
                      {testimonial.quote}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Avatar
                        src={testimonial.image}
                        alt={testimonial.name}
                        sx={{ width: 56, height: 56, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{testimonial.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{testimonial.role}</Typography>
                      </Box>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* App Download Section */}
      <Box
        sx={{
          py: 8,
          bgcolor: theme.palette.primary.light + '15'
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Box
                  component="img"
                  src="https://via.placeholder.com/500x600" // Replace with actual app screenshot
                  alt="DialysisHub Mobile App"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    display: 'block',
                    mx: 'auto',
                    borderRadius: 4,
                    boxShadow: '0 30px 60px rgba(0,0,0,0.1)'
                  }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Typography
                  variant="overline"
                  component="p"
                  color="primary"
                  sx={{ fontWeight: 'bold', mb: 1, letterSpacing: 2 }}
                >
                  MOBILE APP
                </Typography>
                <Typography
                  variant="h2"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  Take Your Care Everywhere
                </Typography>
                <Typography
                  variant="body1"
                  paragraph
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Access your treatment plan, chat with your care team, and track health metrics anytime, anywhere with our mobile app. Available for iOS and Android devices.
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                  <Button
                    variant="contained"
                    color="inherit"
                    size="large"
                    startIcon={<Box component="span" sx={{ fontSize: '1.5rem' }}>🍎</Box>}
                    sx={{
                      bgcolor: '#000',
                      color: '#fff',
                      borderRadius: 2,
                      px: 3,
                      '&:hover': {
                        bgcolor: '#333'
                      }
                    }}
                  >
                    App Store
                  </Button>
                  <Button
                    variant="contained"
                    color="inherit"
                    size="large"
                    startIcon={<Box component="span" sx={{ fontSize: '1.5rem' }}>🤖</Box>}
                    sx={{
                      bgcolor: '#689f38',
                      color: '#fff',
                      borderRadius: 2,
                      px: 3,
                      '&:hover': {
                        bgcolor: '#558b2f'
                      }
                    }}
                  >
                    Google Play
                  </Button>
                </Stack>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                      4.9
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      {[...Array(5)].map((_, i) => (
                        <Box
                          key={i}
                          component="span"
                          sx={{
                            color: theme.palette.warning.main,
                            display: 'inline',
                            mr: 0.5,
                            '& svg': { width: 16, height: 16 }
                          }}
                        >★</Box>
                      ))}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Based on <strong>2,500+</strong> reviews
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>



      {/* Modernized Call to Action */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          top: '-250px',
          left: '-100px',
          filter: 'blur(30px)'
        }} />
        <Box sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          bottom: '-150px',
          right: '5%',
          filter: 'blur(20px)'
        }} />

        <Container sx={{ position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Grid
              container
              spacing={0}
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: { xs: 3, md: 4 },
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  p: { xs: 4, md: 6 },
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <Typography
                  variant="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                  }}
                >
                  Transform Your Dialysis Journey
                </Typography>
                <Typography
                  variant="h6"
                  paragraph
                  sx={{
                    mb: 4,
                    color: 'text.secondary',
                    lineHeight: 1.6
                  }}
                >
                  Join thousands of patients who have improved their quality of life with personalized care plans,
                  streamlined appointment scheduling, and direct communication with healthcare providers.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<IconArrowRight stroke={2.5} />}
                    component={RouterLink}
                    to="/pages/register"
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: `0 10px 20px -10px ${theme.palette.primary.main}`,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 20px 30px -15px ${theme.palette.primary.main}`,
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }
                    }}
                  >
                    Get Started Free
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    component={RouterLink}
                    to="/pages/faq"
                    startIcon={<IconMessage stroke={1.5} />}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      borderWidth: '2px',
                      borderColor: theme.palette.grey[300],
                      color: 'text.primary',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: 'background.paper',
                        transform: 'translateY(-5px)',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>

                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    display: 'flex',
                    mr: 2
                  }}>
                    {[...Array(5)].map((_, i) => (
                      <Box
                        key={i}
                        component="span"
                        sx={{
                          color: theme.palette.warning.main,
                          display: 'inline',
                          mr: 0.5,
                          '& svg': { width: 20, height: 20 }
                        }}
                      >★</Box>
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Trusted by <Box component="span" sx={{ fontWeight: 700 }}>5,000+</Box> patients
                  </Typography>
                </Box>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '100%',
                    minHeight: '450px',
                    width: '100%',
                    transform: 'scale(1.05)',
                    transition: 'transform 0.7s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 50%)`,
                      zIndex: 1
                    }
                  }}
                />
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{ mb: 6, textAlign: 'center' }}
          >
            <Typography
              variant="overline"
              component="p"
              color="primary"
              sx={{ fontWeight: 'bold', mb: 1, letterSpacing: 2 }}
            >
              QUESTIONS & ANSWERS
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Frequently Asked Questions
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              {[
                {
                  question: "Is DialysisHub covered by insurance?",
                  answer: "Yes, many insurance providers cover DialysisHub as part of their telehealth benefits. Contact your insurance provider for specific coverage details."
                },
                {
                  question: "How secure is my medical data?",
                  answer: "DialysisHub is fully HIPAA-compliant and uses enterprise-grade encryption to protect your medical information. Your privacy and data security are our top priorities."
                },
                {
                  question: "Can my entire care team access DialysisHub?",
                  answer: "Yes, DialysisHub is designed to connect your entire care team, including nephrologists, nurses, dietitians, and other specialists involved in your treatment."
                }
              ].map((faq, index) => (
                <Accordion
                  key={index}
                  elevation={0}
                  disableGutters
                  sx={{
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<IconChevronDown />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        my: 2
                      }
                    }}
                  >
                    <Typography variant="h6">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDivider />
                  <AccordionDetails>
                    <Typography variant="body1" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>

            <Grid item xs={12} md={6}>
              {[
                {
                  question: "Can I use DialysisHub on my mobile device?",
                  answer: "Yes, DialysisHub is available as both a web application and mobile app for iOS and Android devices, allowing you to manage your care from anywhere."
                },
                {
                  question: "How do I schedule my first appointment?",
                  answer: "After creating your account, you can request appointments through the platform. Your provider will confirm the time, and it will be added to your personal calendar with automatic reminders."
                },
                {
                  question: "Is technical support available?",
                  answer: "Absolutely! We offer 24/7 technical support via chat, email, and phone to ensure you can always access your care information when needed."
                }
              ].map((faq, index) => (
                <Accordion
                  key={index}
                  elevation={0}
                  disableGutters
                  sx={{
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<IconChevronDown />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        my: 2
                      }
                    }}
                  >
                    <Typography variant="h6">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDivider />
                  <AccordionDetails>
                    <Typography variant="body1" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          </Grid>

          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{
              mt: 6,
              textAlign: 'center',
              p: 4,
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="h5" gutterBottom>Still have questions?</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Our support team is ready to help you with any additional questions.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/contact"
              sx={{
                borderRadius: '30px',
                px: 4
              }}
            >
              Contact Support
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Resources & Educational Content */}
<Box sx={{ py: 10, bgcolor: 'background.default' }}>
  <Container>
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      sx={{ mb: 6, textAlign: 'center' }}
    >
      <Typography
        variant="overline"
        component="p"
        color="primary"
        sx={{ fontWeight: 'bold', mb: 1, letterSpacing: 2 }}
      >
        KNOWLEDGE CENTER
      </Typography>
      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 700 }}
      >
        Educational Resources
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}
      >
        Access our library of resources designed to help you better understand kidney disease, dialysis treatment options, and lifestyle recommendations.
      </Typography>
    </Box>

    <Grid container spacing={3}>
      {[
        {
          title: "Understanding Your Kidney Function Tests",
          category: "Medical Education",
          image: "https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          type: "Article",
          readTime: "5 min read"
        },
        {
          title: "Dialysis Diet: Foods to Enjoy and Avoid",
          category: "Nutrition",
          image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          type: "Video",
          readTime: "10 min watch"
        },
        {
          title: "Managing Fluid Intake Between Treatments",
          category: "Self Care",
          image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          type: "Guide",
          readTime: "7 min read"
        }
      ].map((resource, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  '& .resource-image': {
                    transform: 'scale(1.05)'
                  },
                  '& .resource-title': {
                    color: theme.palette.primary.main
                  }
                }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  height: 200,
                  overflow: 'hidden'
                }}
              >
                <Box
                  className="resource-image"
                  component="img"
                  src={resource.image}
                  alt={resource.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s ease'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    borderRadius: 5,
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  {resource.type}
                </Box>
              </Box>

              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Typography
                  variant="overline"
                  component="div"
                  sx={{
                    color: theme.palette.primary.main,
                    mb: 1
                  }}
                >
                  {resource.category}
                </Typography>
                <Typography
                  className="resource-title"
                  variant="h5"
                  component="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    transition: 'color 0.3s ease',
                    mb: 2
                  }}
                >
                  {resource.title}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {resource.readTime}
                  </Typography>

                  <Button
                    color="primary"
                    endIcon={<IconArrowRight size={16} />}
                    sx={{
                      '&:hover': {
                        bgcolor: 'transparent',
                        '& .MuiButton-endIcon': {
                          transform: 'translateX(3px)'
                        }
                      },
                      '& .MuiButton-endIcon': {
                        transition: 'transform 0.2s ease'
                      }
                    }}
                  >
                    Learn more
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>

    <Box sx={{ textAlign: 'center', mt: 6 }}>
      <Button
        variant="outlined"
        color="primary"
        size="large"
        endIcon={<IconArrowRight />}
        component={RouterLink}
        to="/resources"
        sx={{
          borderRadius: '30px',
          px: 4,
          py: 1.5
        }}
      >
        View All Resources
      </Button>
    </Box>
  </Container>
</Box>


{/* Modern Footer */}
      <Box sx={{ py: 6, bgcolor: theme.palette.grey[900], color: 'white' }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Logo />
              <Typography variant="body2" sx={{ mt: 2, mb: 3, opacity: 0.7 }}>
                Enhancing the quality of life for dialysis patients through innovative technology and compassionate care.
              </Typography>
              <Stack direction="row" spacing={2}>
                <IconButton color="inherit" aria-label="Twitter" sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: theme.palette.primary.main }
                }}>
                  <IconBrandTwitter size={20} />
                </IconButton>
                <IconButton color="inherit" aria-label="Instagram" sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: theme.palette.primary.main }
                }}>
                  <IconBrandInstagram size={20} />
                </IconButton>
                <IconButton color="inherit" aria-label="LinkedIn" sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: theme.palette.primary.main }
                }}>
                  <IconBrandLinkedin size={20} />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Company
              </Typography>
              <Stack spacing={1}>
                {['About Us', 'Our Team', 'Careers', 'Contact Us'].map((item) => (
                  <Button
                    key={item}
                    variant="text"
                    color="inherit"
                    sx={{
                      justifyContent: 'flex-start',
                      opacity: 0.7,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Resources
              </Typography>
              <Stack spacing={1}>
                {['Blog', 'FAQ', 'Support', 'Documentation'].map((item) => (
                  <Button
                    key={item}
                    variant="text"
                    color="inherit"
                    sx={{
                      justifyContent: 'flex-start',
                      opacity: 0.7,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Subscribe to our newsletter
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
                Stay updated with the latest dialysis care innovations and platform updates.
              </Typography>
              <Box
                component="form"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '24px 0 0 24px',
                    border: 'none',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: '0 24px 24px 0',
                    height: '44px',
                    boxShadow: 'none'
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ mt: 4, mb: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                &copy; {new Date().getFullYear()} DialysisHub. All rights reserved.
              </Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={2}>
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                  <Button
                    key={item}
                    variant="text"
                    color="inherit"
                    size="small"
                    sx={{
                      opacity: 0.7,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
