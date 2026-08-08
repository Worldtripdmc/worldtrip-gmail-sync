import React from "react";
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";

const EmailContactDetail = ({ contact, onBack }) => {
  if (!contact) {
    return null;
  }

  const name =
    contact.name ||
    contact.displayName ||
    contact.fullName ||
    contact.email ||
    "Unknown contact";

  const email =
    contact.email ||
    contact.emailAddress ||
    contact.address ||
    "";

  const phone =
    contact.phone ||
    contact.phoneNumber ||
    contact.mobile ||
    "";

  const company =
    contact.company ||
    contact.organization ||
    contact.organisation ||
    "";

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          px: 2,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>

        <Typography
          sx={{
            ml: 1,
            fontSize: 17,
            fontWeight: 600,
          }}
        >
          Contact Details
        </Typography>
      </Box>

      {/* CONTENT */}
      <Box
        sx={{
          p: {
            xs: 2,
            md: 4,
          },
          overflowY: "auto",
        }}
      >
        {/* PROFILE */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "#1976d2",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 25,
              fontWeight: 600,
              mr: 2,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 21,
                fontWeight: 600,
              }}
            >
              {name}
            </Typography>

            {email && (
              <Typography
                sx={{
                  fontSize: 14,
                  color: "#6b7280",
                  mt: 0.5,
                }}
              >
                {email}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* EMAIL */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            border: "1px solid #e5e7eb",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <EmailIcon
              sx={{
                mr: 2,
                color: "#1976d2",
              }}
            />

            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#6b7280",
                }}
              >
                Email
              </Typography>

              <Typography
                sx={{
                  fontSize: 15,
                  mt: 0.3,
                }}
              >
                {email || "Not available"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* PHONE */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            border: "1px solid #e5e7eb",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <PhoneIcon
              sx={{
                mr: 2,
                color: "#1976d2",
              }}
            />

            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#6b7280",
                }}
              >
                Phone
              </Typography>

              <Typography
                sx={{
                  fontSize: 15,
                  mt: 0.3,
                }}
              >
                {phone || "Not available"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* COMPANY */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            border: "1px solid #e5e7eb",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <BusinessIcon
              sx={{
                mr: 2,
                color: "#1976d2",
              }}
            />

            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#6b7280",
                }}
              >
                Company
              </Typography>

              <Typography
                sx={{
                  fontSize: 15,
                  mt: 0.3,
                }}
              >
                {company || "Not available"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ALL CONTACT DATA */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2,
            border: "1px solid #e5e7eb",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 600,
              mb: 2,
            }}
          >
            Contact Information
          </Typography>

          {Object.entries(contact).map(([key, value]) => {
            if (
              value === null ||
              value === undefined ||
              typeof value === "object"
            ) {
              return null;
            }

            return (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  py: 1,
                  borderBottom: "1px solid #f1f3f4",
                }}
              >
                <Typography
                  sx={{
                    width: 180,
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  {key}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 14,
                    wordBreak: "break-word",
                  }}
                >
                  {String(value)}
                </Typography>
              </Box>
            );
          })}
        </Paper>
      </Box>
    </Box>
  );
};

export default EmailContactDetail;