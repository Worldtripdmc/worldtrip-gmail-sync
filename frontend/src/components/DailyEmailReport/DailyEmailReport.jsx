import { useEffect, useState } from "react";

import {
  Refresh as RefreshIcon,
  CalendarMonth as CalendarMonthIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

const DailyEmailReport = ({
  apiBase = "http://localhost:8000/api/gmail",
}) => {
  // ==========================================
  // DATE
  // ==========================================

  const getTodayIndiaDate = () => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());
  };

  const [selectedDate, setSelectedDate] =
    useState(getTodayIndiaDate());

  // ==========================================
  // REPORT STATES
  // ==========================================

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH DAILY REPORT
  // ==========================================

  const fetchDailyReport = async (
    date = selectedDate
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${apiBase}/daily-report?date=${encodeURIComponent(
          date
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to load daily report"
        );
      }

      setReport(result);
    } catch (err) {
      console.error(
        "❌ Daily Report Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load daily report"
      );

      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL REPORT
  // ==========================================

  useEffect(() => {
    fetchDailyReport(selectedDate);
  }, []);

  // ==========================================
  // DATE CHANGE
  // ==========================================

  const handleDateChange = (event) => {
    const newDate = event.target.value;

    setSelectedDate(newDate);

    fetchDailyReport(newDate);
  };

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = () => {
    fetchDailyReport(selectedDate);
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    ).format(new Date(date));
  };

  // ==========================================
  // SUMMARY VALUES
  // ==========================================

  const summary = report?.summary || {};

  const totalEmails =
    summary.totalEmails || 0;

  const uniqueContacts =
    summary.uniqueContacts || 0;

  const newContacts =
    summary.newContacts || 0;

  const existingContacts =
    summary.existingContacts || 0;

  const reportData = report?.data || [];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Box
      sx={{
        p: {
          xs: 1,
          md: 2,
        },
      }}
    >
      {/* ======================================
          HEADER
      ====================================== */}

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
            minHeight: 64,
            display: "flex",
            alignItems: "center",
            px: {
              xs: 1,
              md: 2,
            },
            gap: 1,
          }}
        >
          <CalendarMonthIcon
            sx={{
              color: "#1a73e8",
            }}
          />

          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: "#202124",
            }}
          >
            Daily Email Report
          </Typography>

          <Box
            sx={{
              flexGrow: 1,
            }}
          />

          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={handleDateChange}
            sx={{
              width: {
                xs: 150,
                sm: 170,
              },

              "& .MuiInputBase-input": {
                fontSize: 13,
              },
            }}
          />

          <IconButton
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* ======================================
          CONTENT
      ====================================== */}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e5e7eb",
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
          backgroundColor: "#ffffff",
          minHeight:
            "calc(100vh - 150px)",
        }}
      >
        {/* ==================================
            LOADING
        ================================== */}

        {loading && (
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
              Loading daily report...
            </Typography>
          </Box>
        )}

        {/* ==================================
            ERROR
        ================================== */}

        {!loading && error && (
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
              Unable to load daily report
            </Typography>

            <Typography
              sx={{
                color: "#5f6368",
                fontSize: 13,
                textAlign: "center",
                mb: 2,
              }}
            >
              {error}
            </Typography>

            <Button
              variant="outlined"
              onClick={handleRefresh}
              sx={{
                textTransform: "none",
              }}
            >
              Try Again
            </Button>
          </Box>
        )}

        {/* ==================================
            REPORT
        ================================== */}

        {!loading &&
          !error &&
          report && (
            <Box>
              {/* ==============================
                  REPORT DATE
              ============================== */}

              <Box
                sx={{
                  px: {
                    xs: 2,
                    md: 3,
                  },
                  py: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#5f6368",
                  }}
                >
                  Report Date
                </Typography>

                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#202124",
                    mt: 0.3,
                  }}
                >
                  {selectedDate}
                </Typography>
              </Box>

              <Divider />

              {/* ==============================
                  SUMMARY CARDS
              ============================== */}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr 1fr",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 2,
                  p: {
                    xs: 2,
                    md: 3,
                  },
                }}
              >
                {/* TOTAL EMAILS */}

                <Paper
                  elevation={0}
                  sx={{
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <EmailIcon
                    sx={{
                      color: "#1a73e8",
                      mb: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#5f6368",
                    }}
                  >
                    Total Emails
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#202124",
                      mt: 0.5,
                    }}
                  >
                    {totalEmails}
                  </Typography>
                </Paper>

                {/* UNIQUE CONTACTS */}

                <Paper
                  elevation={0}
                  sx={{
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <PeopleIcon
                    sx={{
                      color: "#1a73e8",
                      mb: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#5f6368",
                    }}
                  >
                    Unique Contacts
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#202124",
                      mt: 0.5,
                    }}
                  >
                    {uniqueContacts}
                  </Typography>
                </Paper>

                {/* NEW CONTACTS */}

                <Paper
                  elevation={0}
                  sx={{
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <PersonAddIcon
                    sx={{
                      color: "#188038",
                      mb: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#5f6368",
                    }}
                  >
                    New Contacts
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#188038",
                      mt: 0.5,
                    }}
                  >
                    {newContacts}
                  </Typography>
                </Paper>

                {/* EXISTING CONTACTS */}

                <Paper
                  elevation={0}
                  sx={{
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <PersonIcon
                    sx={{
                      color: "#5f6368",
                      mb: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#5f6368",
                    }}
                  >
                    Existing Contacts
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#202124",
                      mt: 0.5,
                    }}
                  >
                    {existingContacts}
                  </Typography>
                </Paper>
              </Box>

              <Divider />

              {/* ==============================
                  EMAIL LIST HEADER
              ============================== */}

              <Box
                sx={{
                  minHeight: 56,
                  display: "flex",
                  alignItems: "center",
                  px: {
                    xs: 2,
                    md: 3,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#202124",
                  }}
                >
                  Received Emails
                </Typography>

                <Box
                  sx={{
                    flexGrow: 1,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#5f6368",
                  }}
                >
                  {reportData.length} emails
                </Typography>
              </Box>

              <Divider />

              {/* ==============================
                  NO EMAILS
              ============================== */}

              {reportData.length === 0 && (
                <Box
                  sx={{
                    minHeight: "40vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    px: 2,
                  }}
                >
                  <EmailIcon
                    sx={{
                      fontSize: 56,
                      color: "#dadce0",
                      mb: 2,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 600,
                      color: "#3c4043",
                    }}
                  >
                    No emails received
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 13,
                      color: "#80868b",
                    }}
                  >
                    No received emails were
                    found for this date.
                  </Typography>
                </Box>
              )}

              {/* ==============================
                  EMAIL LIST
              ============================== */}

              {reportData.length > 0 && (
                <Box>
                  {reportData.map(
                    (item, index) => (
                      <Box
                        key={
                          item.gmailId ||
                          item.emailId ||
                          `${item.email}-${index}`
                        }
                        sx={{
                          px: {
                            xs: 2,
                            md: 3,
                          },
                          py: 1.8,
                          borderBottom:
                            "1px solid #f1f3f4",
                          "&:hover": {
                            backgroundColor:
                              "#f8fafd",
                          },
                        }}
                      >
                        {/* TOP ROW */}

                        <Box
                          sx={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#202124",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {item.name ||
                              item.email}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#5f6368",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatTime(
                              item.date
                            )}
                          </Typography>
                        </Box>

                        {/* EMAIL */}

                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "#5f6368",
                            mt: 0.3,
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {item.email}
                        </Typography>

                        {/* SUBJECT */}

                        <Typography
                          sx={{
                            fontSize: 14,
                            color: "#202124",
                            fontWeight: 500,
                            mt: 0.7,
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {item.subject ||
                            "(No Subject)"}
                        </Typography>

                        {/* BOTTOM ROW */}

                        <Box
                          sx={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 1,
                            mt: 0.8,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "#5f6368",
                            }}
                          >
                            {item.domain}
                          </Typography>

                          <Box
                            sx={{
                              px: 1,
                              py: 0.2,
                              borderRadius: 1,
                              backgroundColor:
                                item.type ===
                                "NEW"
                                  ? "#e6f4ea"
                                  : "#f1f3f4",
                              color:
                                item.type ===
                                "NEW"
                                  ? "#188038"
                                  : "#5f6368",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {item.type}
                          </Box>
                        </Box>
                      </Box>
                    )
                  )}
                </Box>
              )}
            </Box>
          )}
      </Paper>
    </Box>
  );
};

export default DailyEmailReport;