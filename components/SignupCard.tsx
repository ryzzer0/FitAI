

import { useState } from "react";
import {
  Modal,
  Stepper,
  Group,
  Radio,
  TextInput,
  Button,
  Paper,
  Flex,
  Space,
  Divider,
  Slider,
  NativeSelect,
  Switch,
  Text,
  SegmentedControl,
  ScrollArea,
  MultiSelect,
  Textarea,
  Input,
  Center,
} from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import styles from "@/styles/SignupCard.module.css";
import { auth, app } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import Lottie from "lottie-react";
import anim from "../public/completion.json";

type FormData = {
  gender: string;
  workoutFrequency: number;
  skill: string;
  goal: string;
  height: string;
  weight: string;
  notes: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: string;
  equipment: { value: string; label: string; image?: string }[];
  mealBudget: string;
  allergies: string;
};

const SignupCard = () => {
  const { register, handleSubmit, control } = useForm<FormData>();
  const [opened, setOpened] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [mealPlan, setMealPlan] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const equipment = [
    { value: "Full gym", label: "Full gym", image: "/fullgym.svg" },
    { value: "Barbells", label: "Barbells", image: "/barbell.svg" },
    { value: "Dumbells", label: "Dumbells", image: "/dumbell.svg" },
    { value: "Kettlebells", label: "Kettlebells" },
    { value: "Machines", label: "Machines" },
    { value: "Bodyweight", label: "Bodyweight" },
    { value: "Resistance Band", label: "Resistance Band" },
    { value: "None", label: "None"},
  ];

  const db = getFirestore(app);
  const onSubmit = (data: FormData) => {
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        // Signed in
        console.log(userCredential);
        const { user } = userCredential;

        sendEmailVerification(user)
          .then(() => {
            console.log("Verification email sent!");
          })
          .catch((error) => {
            console.log("Error sending verification email:", error);
          });
        setIsComplete(true);
        setDoc(doc(db, "users", user.uid), {
          gender: data.gender,
          workoutFrequency: data.workoutFrequency,
          skill: data.skill,
          goal: data.goal,
          height: data.height,
          weight: data.weight,
          notes: data.notes,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          age: data.age,
          equipment: selectedEquipment,
          mealBudget: data.mealBudget || "",
          allergies: data.allergies || "",
        })
          .then(() => {
            console.log("User data saved successfully");
          })
          .catch((error) => {
            console.log("Error saving user data:", error);
          });

        // Here you can also save the rest of the user data to your database
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // .. Handle errors here
        // Check if error is due to email already in use
        if (errorCode === "auth/email-already-in-use") {
          // Display a message to the user
          console.error("This email is already in use.");
        } else {
          // Handle other errors
          console.error(errorMessage);
        }
      });
  };

  const nextStep = () => setActiveStep((current) => current + 1);

  const prevStep = () =>
    setActiveStep((current) => (current > 0 ? current - 1 : current));

  return (
    <>
      <Button onClick={() => setOpened(true)}>Sign Up</Button>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Sign Up"
        withCloseButton
        size="500px"
        styles={{
          title: {
            fontFamily: "Arial, sans-serif", // Use the default font
          },
        }}
      >
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit(data);
            if (activeStep == 1) {
              nextStep();
            }
          })}
        >
          <Stepper
            active={activeStep}
            onStepClick={setActiveStep}
            size="xs"
            breakpoint="sm"
          >
            <Stepper.Step label="Step 1" description="Personal info">
              <Divider my="sm" style={{ width: "100%" }} />
              <Flex direction="column">
                <ScrollArea h={300} type="auto" offsetScrollbars>
                  <Flex direction="row" gap="60px" p="sm">
                    <TextInput
                      {...register("firstName")}
                      label="First Name"
                      placeholder="Enter your first name"
                      required
                    />
                    <TextInput
                      {...register("lastName")}
                      label="Last Name"
                      placeholder="Enter your last name"
                    />
                  </Flex>
                  <Flex direction="row" gap="60px" p="sm">
                    <TextInput
                      {...register("age")}
                      label="Age"
                      placeholder="Enter your age"
                    />
                    <NativeSelect
                      {...register("gender")}
                      data={[
                        "Select your gender",
                        "Male",
                        "Female",
                        "Non-Binary",
                      ]}
                      label="Gender"
                      placeholder="Select your gender"
                    />
                  </Flex>
                  <Flex direction="row" gap="60px" p="sm">
                    <TextInput
                      {...register("email")}
                      label="Email"
                      placeholder="Enter your email"
                      required
                    />
                    <TextInput
                      {...register("password")}
                      label="Password"
                      placeholder="Enter your password"
                      type="password"
                      required
                    />
                  </Flex>
                  <Flex direction="row" gap="20px" p="sm">
                    <Text fw={500} size="sm">
                      Meal Plan
                    </Text>
                    <Switch
                      labelPosition="left"
                      onChange={(e) => setMealPlan(e.target.checked)}
                    />
                  </Flex>
                  {mealPlan && (
                    <Flex direction="column" gap="20px" p="sm">
                      <Controller
                        control={control}
                        name="mealBudget"
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            label="Meal Budget"
                            placeholder="Enter your meal budget"
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="allergies"
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            label="Allergies"
                            placeholder="Mention any allergies"
                          />
                        )}
                      />
                    </Flex>
                  )}
                </ScrollArea>
              </Flex>
            </Stepper.Step>
            <Stepper.Step label="Step 2" description="Fitness details">
              <Divider my="sm" style={{ width: "100%" }} />
              <ScrollArea h={300} type="auto" offsetScrollbars>
                <Flex direction="column">
                  <Flex direction="column" p="sm" gap="xs">
                    <TextInput
                      {...register("height")}
                      label={`Height in ${heightUnit}`}
                      placeholder={`Enter your height in ${heightUnit}`}
                    />
                    <SegmentedControl
                      value={heightUnit}
                      onChange={setHeightUnit}
                      color="violet"
                      data={[
                        { label: "cm", value: "cm" },
                        { label: "feet", value: "feet" },
                      ]}
                    />
                  </Flex>
                  <Flex direction="column" p="sm" gap="xs">
                    <TextInput
                      {...register("weight")}
                      label={`Weight in ${weightUnit}`}
                      placeholder={`Enter your Weight in ${weightUnit}`}
                    />
                    <SegmentedControl
                      value={weightUnit}
                      onChange={setWeightUnit}
                      color="violet"
                      data={[
                        { label: "kg", value: "kg" },
                        { label: "lb", value: "lb" },
                      ]}
                    />
                  </Flex>
                  <Flex direction="column" p="sm" gap="sm">
                    <Controller
                      control={control}
                      name="skill"
                      render={({ field }) => (
                        <Radio.Group
                          {...field}
                          label="How would you rate your current skill level in fitness?"
                          size="sm"
                          onChange={(value) => field.onChange(value)}
                          value={field.value}
                        >
                          <Space h="xs" />
                          <Flex direction="row" justify="center" gap="73px">
                            <Radio
                              size="sm"
                              value="beginner"
                              label="Beginner"
                            />
                            <Radio
                              size="sm"
                              value="intermediate"
                              label="Intermediate"
                            />
                            <Radio size="sm" value="Advance" label="Advance" />
                          </Flex>
                        </Radio.Group>
                      )}
                    />
                  </Flex>
                  <Flex direction="column" p="sm" gap="sm">
                    <Text fw={500} size="sm">
                      How many times would you like to workout per week?
                    </Text>

                    <Controller
                      control={control}
                      name="workoutFrequency"
                      render={({ field }) => (
                        <Slider
                          {...field}
                          defaultValue={2}
                          min={2}
                          max={7}
                          step={1}
                          marks={[
                            { value: 2, label: "2x" },
                            { value: 3, label: "3x" },
                            { value: 4, label: "4x" },
                            { value: 5, label: "5x" },
                            { value: 6, label: "6x" },
                            { value: 7, label: "7x" },
                          ]}
                        />
                      )}
                    />
                  </Flex>
                  <Space h="xs" />
                  <Flex direction="column" p="sm" gap="sm">
                    <Controller
                      control={control}
                      name="goal"
                      render={({ field }) => (
                        <Radio.Group
                          {...field}
                          label="What is your main goal?"
                          size="sm"
                          onChange={(value) => field.onChange(value)}
                          value={field.value}
                        >
                          <Space h="xs" />
                          <Flex gap="md" direction="column">
                            <Radio
                              size="sm"
                              value="lose fat"
                              label="Lose fat"
                              description="Burn alot of calories"
                            />
                            <Radio
                              size="sm"
                              value="get stronger and faster"
                              label="Get stronger and faster"
                              description="Lift more weight"
                            />
                            <Radio
                              size="sm"
                              value="look muscular and toned"
                              label="Look muscular and toned"
                              description="Muscle size and visibilty"
                            />
                          </Flex>
                        </Radio.Group>
                      )}
                    />
                  </Flex>
                  <Flex direction="column" p="sm" gap="sm">
                    <Controller
                      control={control}
                      name="equipment"
                      render={({ field }) => (
                        <MultiSelect
                          data={equipment}
                          label="Select the equipment you have"
                          value={selectedEquipment}
                          onChange={setSelectedEquipment}
                          placeholder="Equipment"
                          searchable
                        />
                      )}
                    />
                  </Flex>
                  <Flex direction="column" p="sm" gap="sm">
                    <Textarea
                      {...register("notes")}
                      label="Notes"
                      placeholder="Enter any special notes"
                    />
                  </Flex>
                </Flex>
              </ScrollArea>
            </Stepper.Step>
            <Stepper.Step label="Step 3" description="Complete">
              <Flex direction="column">
                <Flex direction="column" p="sm" gap="sm">
                  <Text size="xl" weight="semi-bold" align="center">
                    SignUp Complete
                  </Text>
                </Flex>
                <Center>
                  <Lottie
                    animationData={anim}
                    loop={false}
                    style={{ width: "100px", height: "100px" }}
                  />
                </Center>
                <Space h="xs" />
                <Text fw="300" size="sm" align="center">
                  An email has been sent to you. Please verify
                </Text>
              </Flex>
            </Stepper.Step>
          </Stepper>
          <Group position="right" mt="xl">
            {activeStep == 1 && (
              <Button type="submit">
                Sign Up
              </Button>
            )}
            {activeStep > 0 && activeStep < 2 && (
              <Button variant="light" onClick={prevStep}>
                Back
              </Button>
            )}
            {activeStep < 1 && <Button onClick={nextStep}>Next</Button>}
          </Group>
        </form>
      </Modal>
    </>
  );
};

export default SignupCard;
