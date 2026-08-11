import { useEffect, useState } from "react";

import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Inbox as InboxIcon,
  StarBorder as StarBorderIcon,
  Send as SendIcon,
  DraftsOutlined as DraftsOutlinedIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Mail as MailIcon,
} from "@mui/icons-material";

import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";

import "./App.css";
import EmailContactDetail from "./components/EmailContacts/EmailContactDetail";
import DailyEmailReport from "./components/DailyEmailReport/DailyEmailReport";
import GmailInbox from "./components/GmailInbox/GmailInbox";

const drawerWidth = 250;

const API_BASE = "http://localhost:8000/api/gmail";

function App() {
  // ==========================================
  // SIDEBAR
  // ==========================================

  const [mobileOpen, setMobileOpen] = useState(false);

  const [selectedFolder, setSelectedFolder] = useState("Inbox");

  // ==========================================
  // EMAIL STATES
  // ==========================================

  const [emails, setEmails] = useState([]);

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  const [emailLoading, setEmailLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ==========================================
  // CONTACT STATES
  // ==========================================

  const [contacts, setContacts] = useState([]);

  const [contactLoading, setContactLoading] = useState(false);

  const [contactError, setContactError] = useState("");

  const [contactSearch, setContactSearch] = useState("");

  // ==========================================
  // CONTACT PAGINATION
  // ==========================================

  const [contactPage, setContactPage] = useState(1);

  const contactsPerPage = 25;

  const totalContactPages = Math.max(
    Math.ceil(contacts.length / contactsPerPage),
    1
  );

  const paginatedContacts = contacts.slice(
    (contactPage - 1) * contactsPerPage,
    contactPage * contactsPerPage
  );

  // ==========================================
  // FETCH EMAILS
  // ==========================================

  const fetchEmails = async (searchText = "") => {
    try {
      setLoading(true);
      setError("");

      let url = `${API_BASE}/emails`;

      if (searchText.trim()) {
        url += `?search=${encodeURIComponent(
          searchText.trim()
        )}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to load emails"
        );
      }

      setEmails(result.data || []);
    } catch (err) {
      console.error(
        "❌ Fetch Emails Error:",
        err
      );

      setError(
        err.message || "Unable to load emails"
      );

      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH CONTACTS
  // ==========================================

  const fetchContacts = async (
    searchText = ""
  ) => {
    try {
      setContactLoading(true);

      setContactError("");

      let url = `${API_BASE}/contacts`;

      if (searchText.trim()) {
        url += `?search=${encodeURIComponent(
          searchText.trim()
        )}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to load contacts"
        );
      }

      setContacts(result.data || []);
      setContactPage(1);

    } catch (err) {
      console.error(
        "❌ Fetch Contacts Error:",
        err
      );

      setContactError(
        err.message ||
          "Unable to load contacts"
      );

      setContacts([]);
      setContactPage(1);
    } finally {
      setContactLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchEmails();
  }, []);

  // ==========================================
  // SEARCH EMAILS
  // ==========================================

  const handleEmailSearch = () => {
    fetchEmails(search);
  };

  // ==========================================
  // SEARCH CONTACTS
  // ==========================================

  const handleContactSearch = () => {
    fetchContacts(contactSearch);
  };

  // ==========================================
  // REFRESH EMAILS
  // ==========================================

  const handleEmailRefresh = () => {
    fetchEmails(search);
  };

  // ==========================================
  // REFRESH CONTACTS
  // ==========================================

  const handleContactRefresh = () => {
    fetchContacts(contactSearch);
  };

  // ==========================================
// EXPORT CONTACTS
// ==========================================

const handleExportContacts = () => {
  const url =
    `${API_BASE}/contacts/export`;

  window.open(
    url,
    "_blank"
  );
};

  // ==========================================
  // CONTACT PAGINATION HANDLERS
  // ==========================================

  const handlePreviousContactPage = () => {
    setContactPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextContactPage = () => {
    setContactPage((prev) =>
      Math.min(prev + 1, totalContactPages)
    );
  };

  // ==========================================
  // OPEN EMAIL
  // ==========================================

  const handleOpenEmail = async (
    emailId
  ) => {
    try {
      setEmailLoading(true);

      setError("");

      const response = await fetch(
        `${API_BASE}/emails/${emailId}`
      );

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const result =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to load email"
        );
      }

      setSelectedEmail(result.data);
    } catch (err) {
      console.error(
        "❌ Open Email Error:",
        err
      );

      setError(
        err.message ||
          "Unable to open email"
      );
    } finally {
      setEmailLoading(false);
    }
  };


  // ==========================================
  // OPEN INBOX
  // ==========================================

  const handleOpenInbox = () => {
    setSelectedFolder("Inbox");

    setSelectedEmail(null);

    setMobileOpen(false);
  };

// ==========================================
// OPEN CONTACT
// ==========================================

const handleOpenContact = (contact) => {
  console.log("Opening contact:", contact);

  setSelectedContact(contact);
  setSelectedEmail(null);
  setMobileOpen(false);
};

  // ==========================================
  // MENU ITEMS
  // ==========================================

  const menuItems = [
    {
      label: "Inbox",
      icon: <InboxIcon />,
      count: emails.length,
    },
    {
      label: "Contacts",
      icon: <PeopleIcon />,
      count: contacts.length,
    },
    {
  label: "Daily Report",
  icon: <MailIcon />,
  count: 0,
},
    {
      label: "Starred",
      icon: <StarBorderIcon />,
      count: 0,
    },
    {
      label: "Sent",
      icon: <SendIcon />,
      count: 0,
    },
    {
      label: "Drafts",
      icon: <DraftsOutlinedIcon />,
      count: 0,
    },
    {
      label: "Trash",
      icon: <DeleteIcon />,
      count: 0,
    },
  ];
    // ==========================================
  // DRAWER CONTENT
  // ==========================================

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >

      {/* LOGO */}

      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          px: 2,
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1a73e8",
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          WT
        </Box>

        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 15,
              lineHeight: 1.1,
              color: "#202124",
            }}
          >
            WORLD TRIP
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color: "#6b7280",
            }}
          >
            Gmail
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* COMPOSE */}

      <Box
        sx={{
          px: 2,
          py: 2,
        }}
      >
        <Button
          fullWidth
          startIcon={<AddIcon />}
          variant="contained"
          sx={{
            height: 44,
            borderRadius: "22px",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
          }}
        >
          Compose
        </Button>
      </Box>

      {/* MENU */}

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.label}
            selected={
              selectedFolder ===
              item.label
            }
            onClick={() => {

              if (
                item.label ===
                "Inbox"
              ) {
                handleOpenInbox();
                return;
              }

              if (item.label === "Contacts") {
                setSelectedFolder("Contacts");
                setSelectedEmail(null);
setSelectedContact(null);
                setContactPage(1);
                setMobileOpen(false);

                if (contacts.length === 0) {
                  fetchContacts(contactSearch);
                }

                return;
              }

              setSelectedFolder(
                item.label
              );

              setSelectedEmail(null);

              setMobileOpen(false);
            }}
            sx={{
              borderRadius:
                "0 22px 22px 0",
              mb: 0.3,
              minHeight: 44,

              "&.Mui-selected": {
                backgroundColor:
                  "#d3e3fd",
                color: "#174ea6",

                "&:hover": {
                  backgroundColor:
                    "#c6dafc",
                },

                "& .MuiListItemIcon-root":
                  {
                    color:
                      "#174ea6",
                  },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color:
                  selectedFolder ===
                  item.label
                    ? "#174ea6"
                    : "#5f6368",
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight:
                  selectedFolder ===
                  item.label
                    ? 700
                    : 500,
              }}
            />

            {item.count > 0 && (
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {item.count}
              </Typography>
            )}
          </ListItemButton>
        ))}
      </List>

      <Box
        sx={{
          flexGrow: 1,
        }}
      />

      <Divider />

      {/* SETTINGS */}

      <List
        sx={{
          px: 1,
          py: 1,
        }}
      >
        <ListItemButton
          sx={{
            borderRadius: 2,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
            }}
          >
            <SettingsOutlinedIcon />
          </ListItemIcon>

          <ListItemText
            primary="Settings"
            primaryTypographyProps={{
              fontSize: 14,
            }}
          />
        </ListItemButton>
      </List>
    </Box>
  );

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor:
          "#f6f8fc",
      }}
    >

      {/* DESKTOP SIDEBAR */}

      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing:
              "border-box",
            borderRight:
              "1px solid #e5e7eb",
            backgroundColor:
              "#ffffff",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* MOBILE SIDEBAR */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* MAIN AREA */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          marginLeft: {
            xs: 0,
            md: `${drawerWidth}px`,
          },
        }}
      >

        {/* HEADER */}

        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor:
              "#ffffff",
            color: "#202124",
            borderBottom:
              "1px solid #e5e7eb",
          }}
        >
          <Toolbar
            sx={{
              minHeight:
                "64px !important",
              gap: 1,
            }}
          >

            {/* MOBILE MENU */}

            <IconButton
              onClick={() =>
                setMobileOpen(true)
              }
              sx={{
                display: {
                  xs: "inline-flex",
                  md: "none",
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* SEARCH */}

            <Paper
              elevation={0}
              sx={{
                flex: 1,
                maxWidth: 720,
                height: 44,
                display: "flex",
                alignItems:
                  "center",
                px: 1.5,
                backgroundColor:
                  "#f1f3f4",
                borderRadius: "10px",
              }}
            >
              <SearchIcon
                sx={{
                  color: "#5f6368",
                  mr: 1,
                  cursor:
                    "pointer",
                }}
                onClick={() => {
                  if (
                    selectedFolder ===
                    "Contacts"
                  ) {
                    handleContactSearch();
                  } else {
                    handleEmailSearch();
                  }
                }}
              />

              <InputBase
                placeholder={
                  selectedFolder ===
                  "Contacts"
                    ? "Search contacts"
                    : "Search mail"
                }
                fullWidth
                value={
                  selectedFolder ===
                  "Contacts"
                    ? contactSearch
                    : search
                }
                onChange={(e) => {
                  if (
                    selectedFolder ===
                    "Contacts"
                  ) {
                    setContactSearch(
                      e.target.value
                    );
                  } else {
                    setSearch(
                      e.target.value
                    );
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    if (
                      selectedFolder ===
                      "Contacts"
                    ) {
                      handleContactSearch();
                    } else {
                      handleEmailSearch();
                    }
                  }
                }}
                sx={{
                  fontSize: 14,
                }}
              />
            </Paper>

            <Box
              sx={{
                flexGrow: 1,
              }}
            />

            <IconButton>
              <SettingsOutlinedIcon />
            </IconButton>

            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor:
                  "#1a73e8",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              AK
            </Avatar>
          </Toolbar>
        </AppBar>
                {/* ======================================
            CONTACT DATABASE
        ====================================== */}

                {/* ======================================
            CONTACTS
        ====================================== */}

       {selectedFolder === "Contacts" && !selectedContact && (
          <Box
            sx={{
              p: {
                xs: 1,
                md: 2,
              },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: "10px 10px 0 0",
                backgroundColor: "#ffffff",
              }}
            >
              <Box
                sx={{
                  minHeight: 56,
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                }}
              >
<IconButton>
  <PeopleIcon />
</IconButton>

<IconButton onClick={handleContactRefresh}>
  <RefreshIcon />
</IconButton>

<Button
  variant="outlined"
  onClick={handleExportContacts}
  sx={{
    ml: 1,
    textTransform: "none",
    fontSize: 13,
    fontWeight: 600,
    borderRadius: "8px",
  }}
>
  Export Contacts
</Button>

<IconButton>
  <MoreVertIcon />
</IconButton>

                <Box sx={{ flexGrow: 1 }} />

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#5f6368",
                    mr: 1,
                  }}
                >
                  {contacts.length > 0
                    ? `${(contactPage - 1) * contactsPerPage + 1}-${Math.min(
                        contactPage * contactsPerPage,
                        contacts.length
                      )} of ${contacts.length}`
                    : "Contacts"}
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid #e5e7eb",
                borderTop: "none",
                borderRadius: "0 0 10px 10px",
                backgroundColor: "#ffffff",
                minHeight: "calc(100vh - 150px)",
              }}
            >
              {contactLoading && (
                <Box
                  sx={{
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <CircularProgress size={32} />
                  <Typography
                    sx={{
                      mt: 2,
                      color: "#5f6368",
                      fontSize: 14,
                    }}
                  >
                    Loading contacts...
                  </Typography>
                </Box>
              )}

              {!contactLoading && contactError && (
                <Box
                  sx={{
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    px: 2,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#d93025",
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Unable to load contacts
                  </Typography>

                  <Typography
                    sx={{
                      color: "#5f6368",
                      fontSize: 13,
                      textAlign: "center",
                      mb: 2,
                    }}
                  >
                    {contactError}
                  </Typography>

                  <Button
                    variant="outlined"
                    onClick={handleContactRefresh}
                    sx={{ textTransform: "none" }}
                  >
                    Try Again
                  </Button>
                </Box>
              )}

              {!contactLoading &&
                !contactError &&
                contacts.length === 0 && (
                  <Box
                    sx={{
                      minHeight: "60vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      px: 2,
                    }}
                  >
                    <PeopleIcon
                      sx={{
                        fontSize: 64,
                        color: "#dadce0",
                        mb: 2,
                      }}
                    />

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#3c4043",
                      }}
                    >
                      No contacts found
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        color: "#80868b",
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      There are no contacts matching your search.
                    </Typography>
                  </Box>
                )}

              {!contactLoading &&
                !contactError &&
                contacts.length > 0 && (
                  <>
                    <List sx={{ p: 0 }}>
                      {paginatedContacts.map((contact, index) => {
                        const contactName =
                          contact.name ||
                          contact.displayName ||
                          contact.fullName ||
                          contact.email ||
                          "Unknown contact";

                        const contactEmail =
                          contact.email ||
                          contact.emailAddress ||
                          contact.address ||
                          "";
return (
  <ListItemButton
    key={
      contact._id ||
      contact.id ||
      contact.email ||
      `${contactName}-${index}`
    }
    onClick={() => handleOpenContact(contact)}
                            sx={{
                              minHeight: 68,
                              borderBottom:
                                "1px solid #f1f3f4",
                              px: {
                                xs: 1,
                                md: 2,
                              },
                              "&:hover": {
                                backgroundColor: "#f8fafd",
                              },
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                mr: 1.5,
                                bgcolor: "#1a73e8",
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {contactName
                                .charAt(0)
                                .toUpperCase()}
                            </Avatar>

                            <Box
                              sx={{
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#202124",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {contactName}
                              </Typography>

                              {contactEmail && (
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    color: "#5f6368",
                                    mt: 0.3,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {contactEmail}
                                </Typography>
                              )}
                            </Box>

                            <MailIcon
                              sx={{
                                color: "#9aa0a6",
                                fontSize: 20,
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>

                    <Divider />

                    <Box
                      sx={{
                        minHeight: 56,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        px: 2,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={handlePreviousContactPage}
                        disabled={contactPage <= 1}
                      >
                        <ChevronLeftIcon />
                      </IconButton>

                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#5f6368",
                          minWidth: 90,
                          textAlign: "center",
                        }}
                      >
                        Page {contactPage} of {totalContactPages}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={handleNextContactPage}
                        disabled={contactPage >= totalContactPages}
                      >
                        <ChevronRightIcon />
                      </IconButton>
                    </Box>
                  </>
                )}
            </Paper>
          </Box>
        )}

{selectedFolder === "Contacts" && selectedContact && (
  <EmailContactDetail
    contact={selectedContact}
    onBack={() => setSelectedContact(null)}
  />
)}

{/* ======================================
    DAILY EMAIL REPORT
====================================== */}

{selectedFolder === "Daily Report" && (
  <DailyEmailReport
    apiBase={API_BASE}
  />
)}

{/* ======================================
    GMAIL INBOX
====================================== */}

{selectedFolder === "Inbox" && !selectedEmail && (
  <GmailInbox />
)}

        {/* ======================================
            SELECTED EMAIL
        ====================================== */}

        {selectedEmail && (
          <Box
            sx={{
              p: {
                xs: 1,
                md: 2,
              },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                border:
                  "1px solid #e5e7eb",
                borderRadius: "10px",
                backgroundColor:
                  "#ffffff",
                minHeight:
                  "calc(100vh - 100px)",
              }}
            >

              {/* EMAIL TOOLBAR */}

              <Box
                sx={{
                  minHeight: 64,
                  display:
                    "flex",
                  alignItems:
                    "center",
                  px: {
                    xs: 1,
                    md: 2,
                  },
                  borderBottom:
                    "1px solid #e5e7eb",
                }}
              >
                <IconButton
                  onClick={() => {
                    setSelectedEmail(
                      null
                    );
                    setError("");
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>

                <Typography
                  sx={{
                    ml: 1,
                    fontSize: 15,
                    fontWeight:
                      600,
                    color:
                      "#202124",
                  }}
                >
                  Email
                </Typography>
              </Box>

              {/* EMAIL CONTENT */}

              <Box
                sx={{
                  p: {
                    xs: 2,
                    md: 4,
                  },
                }}
              >

                {/* SUBJECT */}

                <Typography
                  sx={{
                    fontSize: {
                      xs: 20,
                      md: 24,
                    },
                    fontWeight:
                      600,
                    color:
                      "#202124",
                    mb: 3,
                  }}
                >
                  {selectedEmail.subject ||
                    "(No Subject)"}
                </Typography>

                {/* SENDER */}

                <Box
                  sx={{
                    display:
                      "flex",
                    alignItems:
                      "flex-start",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor:
                        "#1a73e8",
                      fontSize: 15,
                      fontWeight:
                        600,
                    }}
                  >
                    {(
                      selectedEmail.from?.charAt(
                        0
                      ) || "?"
                    ).toUpperCase()}
                  </Avatar>

                  <Box
                    sx={{
                      flex: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize:
                          14,
                        fontWeight:
                          600,
                        color:
                          "#202124",
                      }}
                    >
                      {selectedEmail.from ||
                        "Unknown sender"}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize:
                          13,
                        color:
                          "#5f6368",
                        mt: 0.3,
                      }}
                    >
                      To:{" "}
                      {selectedEmail.to ||
                        "Unknown recipient"}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize:
                        12,
                      color:
                        "#5f6368",
                    }}
                  >
                    {selectedEmail.date
                      ? new Date(
                          selectedEmail.date
                        ).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month:
                              "short",
                            year:
                              "numeric",
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )
                      : ""}
                  </Typography>
                </Box>

                <Divider />

                {/* EMAIL BODY */}

                <Box
                  sx={{
                    mt: 3,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color:
                      "#202124",
                    whiteSpace:
                      "pre-wrap",
                    wordBreak:
                      "break-word",
                  }}
                >
                  {selectedEmail.body ||
                    selectedEmail.text ||
                    selectedEmail.snippet ||
                    "No email content available."}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

      </Box>
    </Box>
  );
}

export default App;