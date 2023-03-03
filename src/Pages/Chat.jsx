/* eslint-disable react-hooks/exhaustive-deps */

import React from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Request from "../Utils/Request";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import {
  Paper,
  Grid,
  Box,
  InputBase,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Stack,
  Divider,
  Dialog,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Badge,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddIcon from "@mui/icons-material/Add";
import { blue } from "@mui/material/colors";
import ScrollToBottom from "react-scroll-to-bottom";
import InputEmoji from "react-input-emoji";
import { io } from "socket.io-client";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const Chat = () => {
  const navigate = useNavigate();
  const request = new Request();
  const uid = sessionStorage.getItem("uid");

  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  const [Users, setUsers] = React.useState([]);
  const [onlineUsers, setOnlineUsers] = React.useState(null);
  const [usersChat, setUserChat] = React.useState([]);
  const [Chats, setChats] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [currentMessage, setCurrentMessage] = React.useState("");
  const [currentChat, setCurrentChat] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadNotifications, setUnreadNotifications] = React.useState([]);
  const [lastMessage, setLastMessage] = React.useState([]);
  const [socket, setSocket] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  function SimpleDialog(props) {
    const { onClose, selectedValue, open } = props;

    const handleClose = () => {
      onClose(selectedValue);
    };

    const createChat = async (user) => {
      const uid2 = user._id;
      const data = { uid, uid2 };
      const response = await request.createChat(data);
      console.log(response);
      if (response) {
        callPage();
        updateCurrentChat(user);
      }
      onClose(user);
    };

    return (
      <Dialog onClose={handleClose} open={open}>
        <List sx={{ pt: 0 }}>
          {Users.map((user) => (
            <ListItem disableGutters>
              <ListItemButton onClick={() => createChat(user)} key={user._id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.fullName ? user.fullName : user.email}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Dialog>
    );
  }

  SimpleDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.string.isRequired,
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = (value) => {
    setOpen(false);
  };

  React.useEffect(() => {
    if (!uid) {
      navigate("/authentication");
    }
  }, []);

  //Initial Socket
  React.useEffect(() => {
    // const newSocket = io("http://localhost:5000");
    const newSocket = io("https://reat-chat-socket.onrender.com");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  //Online Users
  React.useEffect(() => {
    if (socket === null) return;
    socket.emit("addNewUser", uid);

    socket.on("getOnlineUsers", (res) => {
      setOnlineUsers(res);
    });
    console.log("getOnlineUsers");

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  //Send Message
  React.useEffect(() => {
    if (socket === null) return;

    socket.emit("sendMessage", {
      ...newMessage,
      recipientId: selectedUser._id,
    });
  }, [newMessage]);

  //Recieve Message and Notification
  React.useEffect(() => {
    if (socket === null) return;

    socket.on("getMessage", (res) => {
      if (currentChat) {
        if (currentChat[0]._id !== res.chatId) return;

        setMessages((prev) => [...prev, res]);
      }
    });

    socket.on("getNotification", (res) => {
      let isChatOpen;
      if (currentChat) {
        isChatOpen = currentChat[0].members.some((id) => id === res.senderId);
      }

      if (isChatOpen) {
        setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
      } else {
        setNotifications((prev) => [res, ...prev]);
        addNotification(res.senderId);
      }
    });

    const filN = notifications.filter((not) => not.isRead === false);
    setUnreadNotifications(filN);

    return () => {
      socket.off("getMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat, notifications]);

  React.useEffect(() => {
    callPage();
  }, []);

  const callPage = async () => {
    setIsLoading(true);
    const notifi = await request.get("notification");
    setUnreadNotifications(notifi.data);
    console.log(notifi);

    const chats = await request.findChats(uid);
    setChats(chats.data);
    console.log(chats);

    const users = await request.get("user");
    const filterUser = users.data.filter((user) => user._id !== uid);
    setUsers(filterUser);
    console.log(users);

    let inChat = [];
    chats.data.forEach((element) => {
      users.data.forEach((user) => {
        if (element.members.includes(user._id)) {
          inChat.push(user);
        }
      });
      console.log(inChat);
    });

    const filterChat = inChat.filter((chat) => chat._id !== uid);
    setUserChat(filterChat);
    console.log(usersChat);

    let latestMessage = [];
    chats.data.forEach((element) => {
      const getLatestMessage = async () => {
        const response = await request.findLastMessage(element._id);
        console.log(response);
        latestMessage.push(response.data);
        console.log("latestMessage", latestMessage);
      };
      getLatestMessage();
    });
    setLastMessage(latestMessage);
    setIsLoading(false);
  };

  const trancateText = (text) => {
    let shortText = text.substring(0, 20);

    if (text.length > 20) {
      shortText = shortText + "...";
    }

    return shortText;
  };

  const addNotification = async (senderId) => {
    const isRead = "false";
    const data = { senderId, isRead };
    const notifi = await request.addNotifications(data);
    console.log(notifi);
  };

  const deleteNotification = async (senderId) => {
    const data = { senderId };
    const notifi = await request.deleteNotifications(data);
    console.log(notifi);
  };

  const updateCurrentChat = async (user) => {
    setIsLoading(true);
    setSelectedUser(user);
    const filterChats = Chats.filter((chat) =>
      chat.members.includes(uid && user._id)
    );
    console.log(filterChats);

    setCurrentChat(filterChats);
    const response = await request.findMessages(filterChats[0]._id);
    console.log(response);
    setMessages(response.data);

    const senderId = user._id;
    deleteNotification(senderId);

    const responseNotifications = await request.get("notification");
    setUnreadNotifications(responseNotifications.data);

    notifications.forEach((element) => {
      if (element.senderId === user._id) {
        element.isRead = true;
      }
    });

    const filN = notifications.filter((not) => not.isRead === false);
    setUnreadNotifications(filN);
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (currentMessage !== "") {
      const senderId = uid;
      const chatId = currentChat[0]._id;
      const text = currentMessage;
      const data = { chatId, senderId, text };
      const response = await request.sendMessage(data);
      console.log(response);
      setCurrentMessage("");
      setNewMessage(response.data);
      setMessages((prev) => [...prev, response.data]);
    }
  };

  return (
    <div className="body">
      <Grid container spacing={0}>
        <Grid item xs={12} md={4} className={selectedUser ? "hide" : ""}>
          <Item
            style={{
              height: "100vh",
              backgroundColor: "#FBFCFC",
              overflow: "auto",
              borderRadius: "0",
            }}
            className="body"
          >
            <Paper
              component="form"
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: "100%",
                marginBottom: "20px",
              }}
            >
              <Box sx={{ flexGrow: 0 }}>
                <IconButton
                  sx={{ p: "10px" }}
                  aria-label="menu"
                  onClick={handleOpenUserMenu}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      sessionStorage.removeItem("uid");
                      navigate("/authentication");
                    }}
                  >
                    <Typography textAlign="center">logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search ..."
                inputProps={{ "aria-label": "search" }}
              />
              <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
                <SearchIcon />
              </IconButton>
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <IconButton
                color="primary"
                sx={{ p: "10px" }}
                aria-label="directions"
                onClick={handleClickOpen}
              >
                <AddIcon />
              </IconButton>
            </Paper>

            {usersChat.map((user) => {
              const filterUserNotification = unreadNotifications.filter(
                (n) => n.senderId === user._id
              );
              return (
                <Paper
                  component="form"
                  sx={{
                    overflow: "hidden",
                    marginTop: "10px",
                    p: "10px 10px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    cursor: "pointer",
                  }}
                  key={user._id}
                  onClick={() => updateCurrentChat(user)}
                >
                  <Stack direction="row" spacing={2}>
                    {onlineUsers ? (
                      onlineUsers.some((u) => u.uid === user._id) ? (
                        <Stack direction="row">
                          <StyledBadge
                            overlap="circular"
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            variant="dot"
                          >
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </StyledBadge>
                        </Stack>
                      ) : (
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      )
                    ) : (
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    )}

                    <div style={{ textAlign: "start" }}>
                      <h3>{user.fullName ? user.fullName : user.email}</h3>
                      <p>{user.status ? trancateText(user.status) : trancateText("Hey their, I'm using chat app")}</p>
                    </div>
                    {filterUserNotification.length > 0 && (
                      <div style={{ alignItems: "center" }}>
                        <Badge
                          badgeContent={filterUserNotification.length}
                          color="primary"
                        ></Badge>
                      </div>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Item>
        </Grid>

        {selectedUser ? (
          <Grid item xs={12} md={8} className={selectedUser ? "" : "hide"}>
            <Item
              style={{
                height: "100vh",
                backgroundColor: "#FBFCFC",
                borderRadius: "0",
              }}
              className="body"
            >
              <Paper
                component="form"
                sx={{
                  overflow: "hidden",
                  p: "10px 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Stack direction="row" spacing={2}>
                  <div
                    className="arrowBack"
                    style={{ alignItems: "center", display: "flex" }}
                  >
                    <ArrowBackIcon
                      onClick={() => {
                        setSelectedUser(null);
                        setCurrentChat(null);
                      }}
                    />
                  </div>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                  <div style={{ textAlign: "start" }}>
                    <h3>
                      {selectedUser.fullName
                        ? selectedUser.fullName
                        : selectedUser.email}
                    </h3>
                    {onlineUsers.some((u) => u.uid === selectedUser._id) ? (
                      <p>Online</p>
                    ) : (
                      <p>Offline</p>
                    )}
                  </div>
                </Stack>
              </Paper>
              <div className="chat-body">
                <ScrollToBottom className="message-container">
                  {messages.map((messageContent) => {
                    return (
                      <div
                        className="message"
                        key={messageContent.id}
                        id={uid === messageContent.senderId ? "you" : "other"}
                      >
                        <div>
                          <div className="message-content">
                            <p>{messageContent.text}</p>
                          </div>
                          <div className="message-meta">
                            <p id="time">
                              {moment(messageContent.createdAt).calendar()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </ScrollToBottom>
              </div>

              <Paper
                component="form"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <InputEmoji
                  value={currentMessage}
                  onChange={setCurrentMessage}
                />
                <IconButton
                  color="primary"
                  type="button"
                  sx={{ p: "10px" }}
                  aria-label="message"
                  onClick={handleSendMessage}
                >
                  <SendRoundedIcon />
                </IconButton>
              </Paper>
            </Item>
          </Grid>
        ) : (
          <Grid item xs={12} md={8} className={selectedUser ? "" : "hide"}>
            <Item
              style={{
                height: "100vh",
                backgroundColor: "#FBFCFC",
                borderRadius: "0",
              }}
            >
              <div style={{ marginTop: "40%" }}>
                <h2>Welcome to Chat App</h2>
              </div>
            </Item>
          </Grid>
        )}

        <div>
          <Typography variant="subtitle1" component="div"></Typography>
          <br />
          <SimpleDialog open={open} onClose={handleClose} />
        </div>

        {isLoading && (
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isLoading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
      </Grid>
    </div>
  );
};

export default Chat;
