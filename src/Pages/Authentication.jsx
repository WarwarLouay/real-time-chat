import React from "react";
import axios from "axios";
import Request from "../Utils/Request";
import { useNavigate } from "react-router-dom";
import Constant from "../Utils/Constant";
import {
  createStyles,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Container,
  Group,
  Anchor,
  Center,
} from "@mantine/core";
import OTPInput from "otp-input-react";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import Badge from "@mui/material/Badge";

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 26,
    fontWeight: 900,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  controls: {
    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column-reverse",
    },
  },

  control: {
    [theme.fn.smallerThan("xs")]: {
      width: "100%",
      textAlign: "center",
    },
  },
}));

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 22,
  height: 22,
  border: `2px solid ${theme.palette.background.paper}`,
}));

const Authentication = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const request = new Request();

  const [email, setEmail] = React.useState("");
  const [userInfo, setUserInfo] = React.useState("");
  const [activeCard, setActiveCard] = React.useState("emailCard");
  const [code, setCode] = React.useState("");
  const [minutes, setMinutes] = React.useState(1);
  const [seconds, setSeconds] = React.useState(30);
  const [fullName, setFullName] = React.useState("");
  const [status, setStatus] = React.useState("Hey their, I'm using chat app");
  const [image, setImage] = React.useState("");
  const [imageSrc, setImageSrc] = React.useState("");

  React.useEffect(() => {
    if (activeCard === "otpCard") {
      if (seconds > 0) {
        setTimeout(() => {
          setSeconds(seconds - 1);
        }, 1000);
      }
      if (minutes > 0 && seconds === 0) {
        setSeconds(59);
        setMinutes(0);
        setTimeout(() => {
          setSeconds(seconds - 1);
        }, 1000);
      }
    }
  }, [seconds, activeCard, minutes]);

  const verifyCode = async () => {
    const data = { code };
    const response = await request.verifyCode(data);
    console.log(response);
    if (response.data.message === "true") {
      if (userInfo.fullName) {
        sessionStorage.setItem("uid", userInfo._id);
        navigate("/real-time-chat");
      } else {
        setActiveCard("userInfoCard");
      }
    } else {
      console.log("error code");
    }
  };

  const resendCode = async () => {
    setMinutes(1);
    setSeconds(30);
    const data = { email };
    const response = await request.resendCode(data);
    console.log(response);
  };

  const login = async () => {
    try {
      const { data } = await axios.post(
        `${Constant.serverlink}/api/user`,
        {
          email,
        },
        { withCredentials: true }
      );
      if (data._id) {
        setUserInfo(data);
        setActiveCard("otpCard");
      }
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateProfile = async () => {
    const uid = userInfo._id;
    const data = { uid, fullName, status };
    const response = await request.updateProfile(data);
    console.log(response);
    if (response) {
      sessionStorage.setItem("uid", userInfo._id);
      navigate("/real-time-chat");
    }
  };

  return (
    <React.Fragment>
      {activeCard === "emailCard" && (
        <div>
          <Container size={460} my={30}>
            <Title className={classes.title} align="center">
              Chat App
            </Title>
            <Text color="dimmed" size="sm" align="center">
              Enter your email to get started
            </Text>

            <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
              <TextInput
                label="Your email"
                placeholder="example@domain.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
              />
              <Group position="apart" mt="lg" className={classes.controls}>
                <Anchor color="dimmed" size="sm" className={classes.control}>
                  <Center inline></Center>
                </Anchor>
                <Button className={classes.control} onClick={login}>
                  Continue
                </Button>
              </Group>
            </Paper>
          </Container>
        </div>
      )}

      {activeCard === "otpCard" && (
        <div>
          <Container size={460} my={30}>
            <Title className={classes.title} align="center">
              Verification Code
            </Title>
            <Text color="dimmed" size="sm" align="center">
              Enter the verification code you recieved
            </Text>

            <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
              <OTPInput
                value={code}
                onChange={setCode}
                autoFocus
                OTPLength={6}
                otpType="number"
                disabled={false}
              />
              <Group position="apart" mt="lg">
                <Text color="dimmed" size="sm" align="center" mt={5}>
                  Didn't get a verification code?
                </Text>
                {minutes > 0 || seconds > 0 ? (
                  <Text color="dimmed" size="sm" align="center" mt={5}>
                    0{minutes}:{seconds > 9 ? seconds : "0" + seconds}
                  </Text>
                ) : (
                  <Text
                    style={{ cursor: "pointer" }}
                    size="sm"
                    onClick={resendCode}
                  >
                    resend
                  </Text>
                )}
              </Group>
              <Button onClick={verifyCode} className={classes.control}>
                Continue
              </Button>
            </Paper>
          </Container>
        </div>
      )}

      {activeCard === "userInfoCard" && (
        <div>
          <Container size={460} my={30}>
            <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
              {imageSrc ? (
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  style={{
                    width: "100px",
                    height: "100px",
                    position: "relative",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                  badgeContent={
                    <label htmlFor="file" style={{ cursor: "pointer" }}>
                      <SmallAvatar>
                        <AddIcon />
                      </SmallAvatar>
                    </label>
                  }
                >
                  <Avatar
                    style={{
                      width: "100px",
                      height: "100px",
                      position: "relative",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                    src={imageSrc}
                  />
                </Badge>
              ) : (
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  style={{
                    width: "100px",
                    height: "100px",
                    position: "relative",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                  badgeContent={
                    <label htmlFor="file" style={{ cursor: "pointer" }}>
                      <SmallAvatar>
                        <AddIcon />
                      </SmallAvatar>
                    </label>
                  }
                >
                  <Avatar
                    style={{
                      width: "100px",
                      height: "100px",
                      position: "relative",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <PersonIcon style={{ width: "100px", height: "100px" }} />
                  </Avatar>
                </Badge>
              )}
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                accept=".png, .jpg, .jpeg"
                onChange={(e) => {
                  setImage(e.target.files);
                  const file = e.target.files[0];
                  if (!file) return;
                  setImageSrc(URL.createObjectURL(file));
                }}
              />
              <TextInput
                label="Your name"
                placeholder="Louay Warwar"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextInput
                label="Your status"
                placeholder="status"
                required
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
              <Group position="apart" mt="lg" className={classes.controls}>
                <Anchor color="dimmed" size="sm" className={classes.control}>
                  <Center inline></Center>
                </Anchor>
                <Button className={classes.control} onClick={updateProfile}>
                  Continue
                </Button>
              </Group>
            </Paper>
          </Container>
        </div>
      )}
    </React.Fragment>
  );
};

export default Authentication;
