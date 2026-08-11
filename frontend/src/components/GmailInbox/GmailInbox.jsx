import { useEffect, useState } from "react";

import {
  Inbox as InboxIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  StarBorder as StarBorderIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Mail as MailIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Paper,
  Typography,
} from "@mui/material";

const API_BASE = "http://localhost:8000/api/gmail";

function GmailInbox() {
  // ==========================================
  // MAILBOXES
  // ==========================================

  const [mailboxes, setMailboxes] = useState([]);
  const [mailboxLoading, setMailboxLoading] = useState(false);

  const [selectedMailbox, setSelectedMailbox] =
    useState("ALL");

  // ==========================================
  // EMAILS
  // ==========================================

  const [emails, setEmails] = useState([]);

  const [emailLoading, setEmailLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // SELECTED EMAIL
  // ==========================================

  const [selectedEmail, setSelectedEmail] =
    useState(null);

  const [selectedEmailLoading, setSelectedEmailLoading] =
    useState(false);

  // ==========================================
  // PAGINATION
  // ==========================================

  const [page, setPage] = useState(1);

  const [limit] = useState(50);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // ==========================================
  // SEARCH
  // ==========================================

  const [search, setSearch] = useState("");

  // ==========================================
  // FETCH MAILBOXES
  // ==========================================

  const fetchMailboxes = async () => {
    try {
      setMailboxLoading(true);

      const response = await fetch(
        `${API_BASE}/mailboxes`
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
            "Failed to load mailboxes"
        );
      }

      setMailboxes(result.data || []);
    } catch (err) {
      console.error(
        "❌ Fetch Mailboxes Error:",
        err
      );
    } finally {
      setMailboxLoading(false);
    }
  };

  // ==========================================
  // FETCH EMAILS
  // ==========================================

  const fetchEmails = async (
    mailbox = selectedMailbox,
    requestedPage = page,
    searchText = search
  ) => {
    try {
      setEmailLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set(
        "page",
        String(requestedPage)
      );

      params.set(
        "limit",
        String(limit)
      );

      if (
        mailbox &&
        mailbox !== "ALL"
      ) {
        params.set(
          "mailbox",
          mailbox
        );
      }

      if (
        searchText &&
        searchText.trim()
      ) {
        params.set(
          "search",
          searchText.trim()
        );
      }

      const response = await fetch(
        `${API_BASE}/emails?${params.toString()}`
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
            "Failed to load emails"
        );
      }

      setEmails(result.data || []);

      setPagination(
        result.pagination || {
          page: requestedPage,
          limit,
          total:
            result.data?.length || 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage:
            requestedPage > 1,
        }
      );

      setPage(
        result.pagination?.page ||
          requestedPage
      );
    } catch (err) {
      console.error(
        "❌ Fetch Emails Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load emails"
      );

      setEmails([]);
    } finally {
      setEmailLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchMailboxes();
  }, []);

  // ==========================================
  // LOAD EMAILS AFTER MAILBOXES
  // ==========================================

  useEffect(() => {
    fetchEmails(
      selectedMailbox,
      1,
      search
    );
  }, [selectedMailbox]);

  // ==========================================
  // SELECT MAILBOX
  // ==========================================

  const handleMailboxSelect = (
    mailbox
  ) => {
    setSelectedMailbox(mailbox);
    setPage(1);
    setSelectedEmail(null);
    setSearch("");
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = () => {
    setPage(1);

    fetchEmails(
      selectedMailbox,
      1,
      search
    );
  };

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = () => {
    fetchMailboxes();

    fetchEmails(
      selectedMailbox,
      page,
      search
    );
  };

  // ==========================================
  // PREVIOUS PAGE
  // ==========================================

  const handlePreviousPage = () => {
    if (
      !pagination.hasPreviousPage
    ) {
      return;
    }

    const nextPage =
      Math.max(page - 1, 1);

    setPage(nextPage);

    fetchEmails(
      selectedMailbox,
      nextPage,
      search
    );
  };

  // ==========================================
  // NEXT PAGE
  // ==========================================

  const handleNextPage = () => {
    if (
      !pagination.hasNextPage
    ) {
      return;
    }

    const nextPage =
      page + 1;

    setPage(nextPage);

    fetchEmails(
      selectedMailbox,
      nextPage,
      search
    );
  };

  // ==========================================
  // OPEN EMAIL
  // ==========================================

  const handleOpenEmail = async (
    emailId
  ) => {
    try {
      setSelectedEmailLoading(true);
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

      setSelectedEmail(
        result.data
      );
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
      setSelectedEmailLoading(false);
    }
  };

  // ==========================================
  // GET SELECTED MAILBOX NAME
  // ==========================================

  const selectedMailboxData =
    mailboxes.find(
      (mailbox) =>
        mailbox.email ===
        selectedMailbox
    );

  const selectedMailboxName =
    selectedMailbox === "ALL"
      ? "All Mail"
      : selectedMailboxData?.name ||
        selectedMailbox;

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  // ==========================================
  // EXTRACT SENDER NAME
  // ==========================================

  const getSenderName = (
    from
  ) => {
    if (!from) {
      return "Unknown sender";
    }

    const match =
      from.match(
        /^(.*?)\s*<.*?>$/
      );

    if (match) {
      return match[1].trim();
    }

    return from;
  };

  // ==========================================
  // MAILBOX ITEM
  // ==========================================

  const renderMailbox = (
    mailbox
  ) => {
    const isSelected =
      selectedMailbox ===
      mailbox.email;

    return (
      <ListItemButton
        key={mailbox._id}
        selected={isSelected}
        onClick={() =>
          handleMailboxSelect(
            mailbox.email
          )
        }
        sx={{
          minHeight: 42,
          borderRadius:
            "0 20px 20px 0",
          mb: 0.3,
          px: 2,

          "&.Mui-selected": {
            backgroundColor:
              "#d3e3fd",
            color: "#174ea6",

            "&:hover": {
              backgroundColor:
                "#c6dafc",
            },
          },
        }}
      >
        <Avatar
          sx={{
            width: 28,
            height: 28,
            mr: 1.2,
            bgcolor:
              isSelected
                ? "#1a73e8"
                : "#e8eaed",
            color:
              isSelected
                ? "#ffffff"
                : "#5f6368",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {(
            mailbox.name ||
            mailbox.email ||
            "?"
          )
            .charAt(0)
            .toUpperCase()}
        </Avatar>

        <Typography
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            fontWeight:
              isSelected
                ? 700
                : 500,
            whiteSpace:
              "nowrap",
            overflow:
              "hidden",
            textOverflow:
              "ellipsis",
          }}
        >
          {mailbox.name ||
            mailbox.email}
        </Typography>

        {mailbox.lastSyncStatus ===
          "SUCCESS" && (
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius:
                "50%",
              backgroundColor:
                "#34a853",
            }}
          />
        )}
      </ListItemButton>
    );
  };

  // ==========================================
  // EMAIL LIST
  // ==========================================

  const emailList = (
    <>
      {emailLoading && (
        <Box
          sx={{
            minHeight:
              "60vh",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            flexDirection:
              "column",
          }}
        >
          <CircularProgress
            size={32}
          />

          <Typography
            sx={{
              mt: 2,
              color:
                "#5f6368",
              fontSize: 14,
            }}
          >
            Loading emails...
          </Typography>
        </Box>
      )}

      {!emailLoading &&
        error && (
          <Box
            sx={{
              minHeight:
                "60vh",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              flexDirection:
                "column",
              px: 2,
            }}
          >
            <Typography
              sx={{
                color:
                  "#d93025",
                fontWeight: 600,
              }}
            >
              Unable to load emails
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color:
                  "#5f6368",
                fontSize: 13,
                textAlign:
                  "center",
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

      {!emailLoading &&
        !error &&
        emails.length === 0 && (
          <Box
            sx={{
              minHeight:
                "60vh",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              flexDirection:
                "column",
            }}
          >
            <MailIcon
              sx={{
                fontSize: 64,
                color:
                  "#dadce0",
                mb: 2,
              }}
            />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color:
                  "#3c4043",
              }}
            >
              No emails found
            </Typography>
          </Box>
        )}

      {!emailLoading &&
        !error &&
        emails.length > 0 && (
          <List
            sx={{
              p: 0,
            }}
          >
            {emails.map(
              (email) => (
                <ListItemButton
                  key={
                    email._id
                  }
                  onClick={() =>
                    handleOpenEmail(
                      email._id
                    )
                  }
                  sx={{
                    minHeight: 68,
                    borderBottom:
                      "1px solid #f1f3f4",
                    px: {
                      xs: 1,
                      md: 2,
                    },

                    backgroundColor:
                      email.isRead
                        ? "#ffffff"
                        : "#f2f6fc",

                    "&:hover": {
                      backgroundColor:
                        "#f8fafd",
                    },
                  }}
                >
                  {/* STAR */}

                  <IconButton
                    size="small"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                    sx={{
                      mr: 1,
                    }}
                  >
                    <StarBorderIcon
                      sx={{
                        fontSize: 20,
                        color:
                          "#9aa0a6",
                      }}
                    />
                  </IconButton>

                  {/* SENDER */}

                  <Box
                    sx={{
                      width: {
                        xs: 120,
                        md: 220,
                      },
                      flexShrink: 0,
                      overflow:
                        "hidden",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight:
                          email.isRead
                            ? 500
                            : 700,
                        color:
                          "#202124",
                        whiteSpace:
                          "nowrap",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                      }}
                    >
                      {getSenderName(
                        email.from
                      )}
                    </Typography>
                  </Box>

                  {/* SUBJECT + SNIPPET */}

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display:
                        "flex",
                      alignItems:
                        "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight:
                          email.isRead
                            ? 500
                            : 700,
                        color:
                          "#202124",
                        whiteSpace:
                          "nowrap",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        mr: 1,
                      }}
                    >
                      {email.subject ||
                        "(No Subject)"}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 13,
                        color:
                          "#80868b",
                        whiteSpace:
                          "nowrap",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                      }}
                    >
                      —{" "}
                      {email.snippet ||
                        ""}
                    </Typography>
                  </Box>

                  {/* DATE */}

                  <Typography
                    sx={{
                      ml: 2,
                      fontSize: 12,
                      color:
                        "#5f6368",
                      whiteSpace:
                        "nowrap",
                      display: {
                        xs: "none",
                        sm: "block",
                      },
                    }}
                  >
                    {formatDate(
                      email.date
                    )}
                  </Typography>
                </ListItemButton>
              )
            )}
          </List>
        )}
    </>
  );

  // ==========================================
  // SELECTED EMAIL
  // ==========================================

  if (selectedEmail) {
    return (
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
          {/* TOOLBAR */}

          <Box
            sx={{
              minHeight: 64,
              display: "flex",
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
              onClick={() =>
                setSelectedEmail(
                  null
                )
              }
            >
              <ArrowBackIcon />
            </IconButton>

            <Typography
              sx={{
                ml: 1,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {selectedMailboxName}
            </Typography>
          </Box>

          {/* CONTENT */}

          {selectedEmailLoading ? (
            <Box
              sx={{
                minHeight:
                  "60vh",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                p: {
                  xs: 2,
                  md: 4,
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: 20,
                    md: 24,
                  },
                  fontWeight: 600,
                  color:
                    "#202124",
                  mb: 3,
                }}
              >
                {selectedEmail.subject ||
                  "(No Subject)"}
              </Typography>

              <Box
                sx={{
                  display: "flex",
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
                    fontWeight: 600,
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
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {selectedEmail.from ||
                      "Unknown sender"}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 13,
                      color:
                        "#5f6368",
                      mt: 0.3,
                    }}
                  >
                    To:{" "}
                    {selectedEmail.to ||
                      "Unknown recipient"}
                  </Typography>

                  {selectedEmail.cc && (
                    <Typography
                      sx={{
                        fontSize: 13,
                        color:
                          "#5f6368",
                        mt: 0.3,
                      }}
                    >
                      Cc:{" "}
                      {selectedEmail.cc}
                    </Typography>
                  )}
                </Box>

                <Typography
                  sx={{
                    fontSize: 12,
                    color:
                      "#5f6368",
                  }}
                >
                  {selectedEmail.date
                    ? new Date(
                        selectedEmail.date
                      ).toLocaleString(
                        "en-IN"
                      )
                    : ""}
                </Typography>
              </Box>

              <Divider />

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
          )}
        </Paper>
      </Box>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: {
          xs: 1,
          md: 2,
        },
      }}
    >
      {/* ======================================
          MAILBOX SIDEBAR
      ====================================== */}

      <Paper
        elevation={0}
        sx={{
          width: {
            xs: 180,
            md: 250,
          },
          flexShrink: 0,
          border:
            "1px solid #e5e7eb",
          borderRadius: "10px",
          backgroundColor:
            "#ffffff",
          height:
            "calc(100vh - 100px)",
          overflowY: "auto",
        }}
      >
        {/* ALL MAIL */}

        <List
          sx={{
            p: 1,
          }}
        >
          <ListItemButton
            selected={
              selectedMailbox ===
              "ALL"
            }
            onClick={() =>
              handleMailboxSelect(
                "ALL"
              )
            }
            sx={{
              minHeight: 44,
              borderRadius:
                "0 22px 22px 0",
              mb: 1,

              "&.Mui-selected": {
                backgroundColor:
                  "#d3e3fd",
                color:
                  "#174ea6",
              },
            }}
          >
            <ListItemButton
              sx={{
                p: 0,
                minHeight: 0,
              }}
              disableRipple
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  mr: 1.2,
                  bgcolor:
                    selectedMailbox ===
                    "ALL"
                      ? "#1a73e8"
                      : "#e8eaed",
                  color:
                    selectedMailbox ===
                    "ALL"
                      ? "#ffffff"
                      : "#5f6368",
                  fontSize: 12,
                }}
              >
                <InboxIcon
                  sx={{
                    fontSize: 17,
                  }}
                />
              </Avatar>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight:
                    selectedMailbox ===
                    "ALL"
                      ? 700
                      : 500,
                }}
              >
                All Mail
              </Typography>
            </ListItemButton>
          </ListItemButton>

          <Divider sx={{ mb: 1 }} />

          {/* MAILBOXES */}

          {mailboxLoading ? (
            <Box
              sx={{
                py: 3,
                display: "flex",
                justifyContent:
                  "center",
              }}
            >
              <CircularProgress
                size={24}
              />
            </Box>
          ) : (
            mailboxes.map(
              renderMailbox
            )
          )}
        </List>
      </Paper>

      {/* ======================================
          EMAIL AREA
      ====================================== */}

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* TOOLBAR */}

        <Paper
          elevation={0}
          sx={{
            border:
              "1px solid #e5e7eb",
            borderRadius:
              "10px 10px 0 0",
            backgroundColor:
              "#ffffff",
          }}
        >
          <Box
            sx={{
              minHeight: 56,
              display: "flex",
              alignItems:
                "center",
              px: 1,
            }}
          >
            <InboxIcon
              sx={{
                ml: 1,
                mr: 1,
                color:
                  "#5f6368",
              }}
            />

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color:
                  "#202124",
              }}
            >
              {selectedMailboxName}
            </Typography>

            <IconButton
              onClick={
                handleRefresh
              }
              sx={{
                ml: 1,
              }}
            >
              <RefreshIcon />
            </IconButton>

            <IconButton>
              <MoreVertIcon />
            </IconButton>

            <Box
              sx={{
                flexGrow: 1,
              }}
            />

            <Typography
              sx={{
                fontSize: 12,
                color:
                  "#5f6368",
                mr: 1,
              }}
            >
              {pagination.total > 0
                ? `${
                    (page - 1) *
                      limit +
                    1
                  }-${
                    Math.min(
                      page * limit,
                      pagination.total
                    )
                  } of ${
                    pagination.total
                  }`
                : "0 emails"}
            </Typography>

            <IconButton
              size="small"
              onClick={
                handlePreviousPage
              }
              disabled={
                !pagination.hasPreviousPage
              }
            >
              <ChevronLeftIcon />
            </IconButton>

            <IconButton
              size="small"
              onClick={
                handleNextPage
              }
              disabled={
                !pagination.hasNextPage
              }
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* EMAIL LIST */}

        <Paper
          elevation={0}
          sx={{
            border:
              "1px solid #e5e7eb",
            borderTop: "none",
            borderRadius:
              "0 0 10px 10px",
            backgroundColor:
              "#ffffff",
            minHeight:
              "calc(100vh - 156px)",
            overflow:
              "hidden",
          }}
        >
          {emailList}
        </Paper>
      </Box>
    </Box>
  );
}

export default GmailInbox;
