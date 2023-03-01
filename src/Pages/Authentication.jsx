import React from "react";
import axios from "axios";
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

const Authentication = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");

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
        sessionStorage.setItem("uid", data._id);
        navigate("/real-time-chat");
      }
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
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
          onChange={(e) => setEmail(e.target.value)}
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
  );
};

export default Authentication;
