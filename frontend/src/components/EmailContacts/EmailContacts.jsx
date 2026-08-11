import { useEffect, useState } from "react";

import {
  People as PeopleIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";


// ==========================================
// EMAIL CONTACTS COMPONENT
// ==========================================

function EmailContacts({
  contacts = [],
  contactLoading = false,
  contactError = "",
  handleContactRefresh,
}) {

  // ==========================================
  // PAGINATION
  // ==========================================

  const [contactPage, setContactPage] =
    useState(1);

  const contactsPerPage = 25;


  // ==========================================
  // RESET PAGE WHEN CONTACTS CHANGE
  // ==========================================

  useEffect(() => {
    setContactPage(1);
  }, [contacts.length]);


  // ==========================================
  // TOTAL PAGES
  // ==========================================

  const totalContactPages = Math.max(
    Math.ceil(
      contacts.length / contactsPerPage
    ),
    1
  );


  // ==========================================
  // PAGINATED CONTACTS
  // ==========================================

  const paginatedContacts =
    contacts.slice(
      (contactPage - 1) *
        contactsPerPage,

      contactPage *
        contactsPerPage
    );


  // ==========================================
  // PAGE CHANGE
  // ==========================================

  const handlePreviousPage = () => {
    setContactPage((prev) =>
      Math.max(prev - 1, 1)
    );
  };


  const handleNextPage = () => {
    setContactPage((prev) =>
      Math.min(
        prev + 1,
        totalContactPages
      )
    );
  };


  // ==========================================
// EXPORT CONTACTS
// ==========================================

const handleExportContacts = () => {
  const url =
    "http://localhost:8000/api/gmail/contacts/export";

  window.open(
    url,
    "_blank"
  );
};


  // ==========================================
  // CSV VALUE ESCAPE
  // ==========================================

  const escapeCsvValue = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    const stringValue =
      String(value);

    return `"${stringValue.replace(
      /"/g,
      '""'
    )}"`;
  };

  // ==========================================
  // FORMAT DATE FOR CSV
  // ==========================================

  const formatDateForCsv = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // EXPORT CONTACTS
  // ==========================================

  const handleExportContacts = () => {
    if (!contacts.length) {
      return;
    }

    // ======================================
    // CSV HEADER
    // ======================================

    const headers = [
      "Email",
      "Name",
      "First Email",
      "Last Email",
      "Total Emails",
      "Source",
      "Status",
      "Domain",
    ];

    // ======================================
    // CSV ROWS
    // ======================================

    const rows =
      contacts.map(
        (contact) => [
          escapeCsvValue(
            contact.email
          ),

          escapeCsvValue(
            contact.name
          ),

          escapeCsvValue(
            formatDateForCsv(
              contact.firstEmail
            )
          ),

          escapeCsvValue(
            formatDateForCsv(
              contact.lastEmail
            )
          ),

          escapeCsvValue(
            contact.totalEmails || 0
          ),

          escapeCsvValue(
            contact.source || "Gmail"
          ),

          escapeCsvValue(
            contact.status || "Active"
          ),

          escapeCsvValue(
            contact.domain
          ),
        ]
      );

    // ======================================
    // CREATE CSV
    // ======================================

    const csvContent = [
      headers
        .map(
          escapeCsvValue
        )
        .join(","),

      ...rows.map(
        (row) =>
          row.join(",")
      ),
    ].join("\r\n");

    // ======================================
    // UTF-8 BOM
    // ======================================
    //
    // Excel / Google Sheets ke liye
    // Hindi/Unicode names properly support
    // karne ke liye BOM add kar rahe hain.
    //
    // ======================================

    const csvWithBom =
      "\uFEFF" +
      csvContent;

    // ======================================
    // CREATE FILE
    // ======================================

    const blob =
      new Blob(
        [csvWithBom],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    // ======================================
    // DOWNLOAD
    // ======================================

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `WorldTrip_Gmail_Contacts_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

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
          CONTACT HEADER
      ====================================== */}

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
            minHeight: 60,

            display: "flex",

            alignItems:
              "center",

            px: {
              xs: 1,
              md: 2,
            },

            gap: 1,
          }}
        >

          {/* CONTACT ICON */}

          <PeopleIcon
            sx={{
              color:
                "#1a73e8",
            }}
          />


          {/* TITLE */}

          <Typography
            sx={{
              fontSize: 16,

              fontWeight: 700,

              color:
                "#202124",
            }}
          >
            Email Contacts
          </Typography>


          {/* COUNT */}

          <Typography
            sx={{
              fontSize: 13,

              color:
                "#5f6368",

              ml: 0.5,
            }}
          >
            ({contacts.length})
          </Typography>


          <Box
            sx={{
              flexGrow: 1,
            }}
          />

          {/* EXPORT */}

          <Button
            variant="outlined"
            startIcon={
              <DownloadIcon />
            }
            onClick={
              handleExportContacts
            }
            disabled={
              contactLoading ||
              contacts.length === 0
            }
            sx={{
              textTransform:
                "none",

              fontSize: 13,

              fontWeight: 600,

              borderRadius:
                "8px",

              mr: 0.5,
            }}
          >
            Export Contacts
          </Button>

          {/* REFRESH */}

          <IconButton
            onClick={
              handleContactRefresh
            }
          >
            <RefreshIcon />
          </IconButton>


          {/* MORE */}

          <IconButton>
            <MoreVertIcon />
          </IconButton>
    
        </Box>
    
      </Paper>


      {/* ======================================
          CONTACT TABLE
      ====================================== */}

      <Paper
        elevation={0}
        sx={{
          border:
            "1px solid #e5e7eb",

          borderTop:
            "none",

          borderRadius:
            "0 0 10px 10px",

          backgroundColor:
            "#ffffff",

          overflow:
            "hidden",
        }}
      >

        {/* ====================================
            LOADING
        ==================================== */}

        {contactLoading && (
          <Box
            sx={{
              minHeight:
                "60vh",

              display:
                "flex",

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
              Loading contacts...
           
            </Typography>
          </Box>
        )}


        {/* ====================================
            ERROR
        ==================================== */}

        {!contactLoading &&
   
   contactError && (
            <Box
              sx={{
                minHeight:
                  "60vh",

                display:
                  "flex",

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

                  fontWeight:
                    600,

                  mb: 1,
                }}
              >
                Unable to load contacts
              </Typography>


              <Typography
                sx={{
                  color:
                    "#5f6368",

                  fontSize: 13,

                  textAlign:
                    "center",

                  mb: 2,
                }}
              >
                {contactError}
              </Typography>

              <Button
                variant="outlined"
                onClick={
                  handleContactRefresh
                }
                sx={{
                  textTransform:
                    "none",
                }}
              >
                Try Again
              </Button>
      
            </Box>
          )}

     
        {/* ====================================
            NO CONTACTS
        ==================================== */}

        {!contactLoading &&
          !contactError &&
          contacts.length === 0 && (
 
            <Box
              sx={{
                minHeight:
                  "60vh",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                flexDirection:
                  "column",

                px: 2,
              }}
            >
   
              <PeopleIcon
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
                  fontWeight:
                    600,

                  color:
                    "#3c4043",
                }}
              >
                No contacts found
              </Typography>


              <Typography
                sx={{
                  mt: 0.5,

                  color:
                    "#80868b",

                  fontSize: 14,

                  textAlign:
                    "center",
                }}
              >
                No email contacts are available.
              </Typography>
   
            </Box>
          )}

   
        {/* ====================================
            CONTACT TABLE
        ==================================== */}

        {!contactLoading &&
          !contactError &&
          contacts.length > 0 && (
   
            <Box
              sx={{
                width: "100%",

                overflowX:
                  "auto",
              }}
            >
   
              <Box
                sx={{
                  minWidth:
                    1050,
                }}
              >
   
                {/* ==================================
                    TABLE HEADER
                ================================== */}

                <Box
                  sx={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "240px 190px 150px 150px 110px 90px 90px 180px",

                    minHeight:
                      48,

                    alignItems:
                      "center",

                    backgroundColor:
                      "#f8fafd",

                    borderBottom:
                      "1px solid #e5e7eb",

                    px: 2,
                  }}
                >
  
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#5f6368",
                    }}
                  >
                    EMAIL
                  </Typography>


                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#5f6368",
                    }}
                  >
                    NAME
                  </Typography>


                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#5f6368",
                    }}
                  >
                    FIRST EMAIL
                  </Typography>


                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#5f6368",
                    }}
                  >
                    LAST EMAIL
                  </Typography>


                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#5f6368",
                    }}
                  >
                    TOTAL EMAILS
                  </Typography>


                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#5f6368",
                    }}
                  >
                    SOURCE
                  </Typography>


                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#5f6368",
                    }}
                  >
                    STATUS
                  </Typography>


                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#5f6368",
                    }}
                  >
                    DOMAIN
                  </Typography>
 
                </Box>


                {/* ==================================
                    TABLE ROWS
                ================================== */}

                {paginatedContacts.map(
                  (
                    contact,
                    index
                  ) => (
   
                    <Box
                      key={
                        contact.email ||
                        index
                      }
  
                      sx={{
                        display:
                          "grid",

                        gridTemplateColumns:
                          "240px 190px 150px 150px 110px 90px 90px 180px",

                        minHeight:
                          62,

                        alignItems:
                          "center",

                        px: 2,

                        borderBottom:
                          "1px solid #f1f3f4",

                        "&:hover": {
                          backgroundColor:
                            "#f8fafd",
                        },
                      }}
                    >
 
                      {/* EMAIL */}

                      <Box
                        sx={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          minWidth:
                            0,
                        }}
                      >
  
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,

                            mr: 1.2,

                            bgcolor:
                              "#e8f0fe",

                            color:
                              "#174ea6",

                            fontSize: 13,

                            fontWeight:
                              700,
                          }}
                        >
                          {(
                            contact.name ||
                            contact.email ||
                            "?"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </Avatar>


                        <Typography
                          sx={{
                            fontSize: 13,

                            color:
                              "#202124",

                            fontWeight:
                              500,

                            whiteSpace:
                              "nowrap",

                            overflow:
                              "hidden",

                            textOverflow:
                              "ellipsis",
                          }}
   
                          title={
                            contact.email
                          }
                        >
                          {contact.email ||
                            "-"}
                        </Typography>
  
                      </Box>


                      {/* NAME */}

                      <Typography
                        sx={{
                          fontSize: 13,

                          color:
                            "#202124",

                          whiteSpace:
                            "nowrap",

                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",
                        }}
  
                        title={
                          contact.name
                        }
                      >
                        {contact.name ||
                          "-"}
                      </Typography>


                      {/* FIRST EMAIL */}

                      <Typography
                        sx={{
                          fontSize: 12,

                          color:
                            "#5f6368",
                        }}
                      >
                        {contact.firstEmail
                          ? new Date(
                              contact.firstEmail
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",

                                month:
                                  "short",

                                year:
                                  "numeric",
                              }
                            )
                          : "-"}
                      </Typography>


                      {/* LAST EMAIL */}

                      <Typography
                        sx={{
                          fontSize: 12,

                          color:
                            "#5f6368",
                        }}
                      >
                        {contact.lastEmail
                          ? new Date(
                              contact.lastEmail
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",

                                month:
                                  "short",

                                year:
                                  "numeric",
                              }
                            )
                          : "-"}
                      </Typography>


                      {/* TOTAL EMAILS */}

                      <Typography
                        sx={{
                          fontSize: 13,

                          fontWeight:
                            600,

                          color:
                            "#202124",
                        }}
                      >
                        {contact.totalEmails ||
                          0}
                      </Typography>


                      {/* SOURCE */}

                      <Typography
                        sx={{
                          fontSize: 12,

                          color:
                            "#5f6368",
                        }}
                      >
                        {contact.source ||
                          "Gmail"}
                      </Typography>


                      {/* STATUS */}

                      <Box>
  
                        <Typography
                          sx={{
                            display:
                              "inline-flex",

                            px: 1,

                            py: 0.4,

                            borderRadius:
                              "12px",

                            backgroundColor:
                              "#e6f4ea",

                            color:
                              "#137333",

                            fontSize: 11,

                            fontWeight:
                              600,
                          }}
                        >
                          {contact.status ||
                            "Active"}
                        </Typography>
 
                      </Box>


                      {/* DOMAIN */}

                      <Typography
                        sx={{
                          fontSize: 12,

                          color:
                            "#1a73e8",

                          whiteSpace:
                            "nowrap",

                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",
                        }}
   
                        title={
                          contact.domain
                        }
                      >
                        {contact.domain ||
                          "-"}
                      </Typography>
  
                    </Box>
                  )
                )}


                {/* ==================================
                    PAGINATION
                ================================== */}

                <Box
                  sx={{
                    minHeight:
                      58,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "flex-end",

                    px: 2,

                    gap: 1,
                  }}
                >
 
                  <Typography
                    sx={{
                      fontSize: 12,

                      color:
                        "#5f6368",

                      mr: 1,
                    }}
                  >
                    {(contactPage - 1) *
                      contactsPerPage +
                      1}

                    -

                    {Math.min(
                      contactPage *
                        contactsPerPage,

                      contacts.length
                    )}

                    {" "}of{" "}

                    {contacts.length}
                  </Typography>


                  {/* PREVIOUS */}

                  <IconButton
                    size="small"
  
                    disabled={
                      contactPage <= 1
                    }
  
                    onClick={
                      handlePreviousPage
                    }
                  >
                    <ChevronLeftIcon />
  
                  </IconButton>


                  {/* PAGE NUMBER */}

                  <Typography
                    sx={{
                      fontSize: 12,

                      fontWeight:
                        600,

                      minWidth:
                        55,

                      textAlign:
                        "center",
                    }}
                  >
                    Page{" "}
                    {contactPage}{" "}
                    /{" "}
                    {
                      totalContactPages
                    }
                  </Typography>


                  {/* NEXT */}

                  <IconButton
                    size="small"
 
                    disabled={
                      contactPage >=
                      totalContactPages
                    }
 
                    onClick={
                      handleNextPage
                    }
                  >
                    <ChevronRightIcon />
                  </IconButton>
 
                </Box>
 
              </Box>
 
            </Box>
          )}
 
      </Paper>
 
    </Box>
  );
}

export default EmailContacts;