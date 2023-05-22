import { useState } from "react";
import {
  Modal,
  TextInput,
  Checkbox,
  Button,
  Group,
  Space,
  Paper,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { notifications } from "@mantine/notifications";
import styles from "@/styles/LoginCard.module.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "next/router";

type FormData = {
  email: string;
  password: string;
  remember: boolean;
};

const LoginCard = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormData>();
  const [opened, setOpened] = useState(false);

  const onSubmit = (data: FormData) => {
    console.log("Attempting to login with data:", data);

    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // You can now use the 'user' object
        console.log("Successfully logged in as user:", user);

        // Navigate to the user-specific page
        router.push(`/user/${user.uid}`);

        notifications.show({
          title: "Login successful!",
          message: "You have successfully logged in!",
          color: "blue",
        });
        setOpened(false);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error logging in:", errorCode, errorMessage);
        // Show an error notification
        notifications.show({
          title: "Error logging in!",
          message: errorMessage,
          color: "red",
        });
      });
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Login"
        withCloseButton
        styles={{
          title: {
            fontFamily: "Arial, sans-serif", // Use the default font
          },
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
          <TextInput
            {...register("email")}
            label="Email"
            placeholder="Enter your email"
            required
          />
          <Space h="sm" />
          <TextInput
            {...register("password")}
            label="Password"
            placeholder="Enter your password"
            type="password"
            required
          />
          <Space h="sm" />
          <Checkbox
            {...register("remember")}
            label="Remember my email and password"
          ></Checkbox>
          <Space h="lg" />
          <Button type="submit">Login</Button>
        </form>
      </Modal>
      <Group position="center">
        <Button variant="light" onClick={() => setOpened(true)}>
          Login
        </Button>
      </Group>
    </>
  );
};

export default LoginCard;
