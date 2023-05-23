import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { auth, app } from "../../firebase";
import { Flex, Avatar, Text, Paper, Center, Title, Button } from "@mantine/core";
import axios from "axios";
import styles from "@/styles/UserPage.module.css";
import { getAuth } from "firebase/auth";
import Lottie from "lottie-react";
import anim from "../../public/loading.json";


// Define your user data structure
interface UserData {
  email: string;
  chatGptResponse?: string;
  gender: string;
  workoutFrequency: string;
  skill: string;
  goal: string;
  height: string;
  weight: string;
  notes: string;
  firstName: string;
  lastName: string;
  age: string;
  equipment: { value: string; label: string; image?: string }[];
  mealBudget: string;
  allergies: string;
  // include other fields as required
}

const UserPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    if (id && typeof id === "string") {
      const db = getFirestore(app);
      const userRef = doc(db, "users", id);
      getDoc(userRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            setUserData(docSnapshot.data() as UserData);
          } else {
            console.log("No such document!");
            setUserData(null);
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    }
  }, [id]);

  useEffect(() => {
    console.log("userData:", userData);
    if (userData && !userData.chatGptResponse) {
      generateChatGptResponse(userData).then((response) => {
        console.log("response:", response);
        if (response) {
          updateUserData(id as string, { chatGptResponse: response });
          setUserData((prevUserData) => {
            if (prevUserData) {
              return { ...prevUserData, chatGptResponse: response };
            }
            return null;
          });
        }
      });
    }
  }, [userData]);

  async function generateChatGptResponse(userData: UserData) {
    try {
      const {
        gender,
        workoutFrequency,
        skill,
        goal,
        height,
        weight,
        notes,
        equipment,
        mealBudget,
        allergies,
      } = userData;

      let prompt = `
      Gender: ${gender}
      Workout Frequency: ${workoutFrequency}
      Skill Level: ${skill}
      Goal: ${goal}
      Height: ${height}
      Weight: ${weight}
      Notes: ${notes}
      Equipment: ${equipment}
    `;

      if (mealBudget && allergies) {
        prompt += `
        Meal Budget: ${mealBudget}
        Allergies: ${allergies}
      `;
      }

      prompt +=
        "\nGenerate Fitness Plan including what days he should be doing what exercises";

      if (mealBudget && allergies) {
        prompt += " and Meal Plan according";
      }

      const response = await axios.post(
        "https://api.openai.com/v1/engines/text-davinci-003/completions",
        {
          prompt,
          max_tokens: 1000,
          temperature: 0.7,
          n: 1,
        },
        {
          headers: {
            Authorization:
              `Bearer ${process.env.API_KEY}`, // Replace with your OpenAI API key
            "Content-Type": "application/json",
          },
        }
      );

      const { choices } = response.data;
      const generatedResponse = choices[0].text.trim();

      console.log("Generated response:", generatedResponse);

      return generatedResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error:",
          error.response ? error.response.data : error
        );
      } else {
        console.error("Unknown error:", error);
      }
      return null;
    }
  }

  async function updateUserData(
    userId: string,
    updatedData: Partial<UserData>
  ) {
    try {
      const db = getFirestore(app);
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, updatedData);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  }

  return (
    <>
      {userData && (
        <Flex p="lg" style={{ justifyContent: "space-between" }}>
          <img src="/logo.png" alt="logo" className={styles.logo} />
          <Text style={{ marginRight: "10%" }}>
            Welcome, {userData.firstName}
          </Text>
          <Button
          color="teal"
          variant="light"
            onClick={(event) => {
              event.stopPropagation(); // Prevent the outer div's onClick from being triggered
              auth
                .signOut()
                .then(() => {
                  router.push("/");
                })
                .catch((error) => {
                  console.error("Error signing out:", error);
                });
            }}
          >
            Logout
          </Button>
        </Flex>
      )}
      <Paper style={{ width: "500px", margin: "auto" }}>
        <Center>
          {userData && userData.chatGptResponse ? (
            <div>
              {userData.chatGptResponse.split("\n").slice(1).map((line, index) => {
                if (line.includes("-")) {
                  let parts = line.split("-");
                  return (
                    <Text key={index}>
                      {parts[0]}
                      <span style={{ color: "teal", fontWeight: "700" }}>
                        -
                      </span>
                      {parts.slice(1).join("-")}
                    </Text>
                  );
                } else if (line.includes(":") && line.includes("day")) {
                  return (
                    <Text
                      c="violet"
                      fw="500"
                      size="lg"
                      style={{ marginTop: "20px" }}
                      key={index}
                    >
                      {line}
                    </Text>
                  );
                } else {
                  return <Text key={index} color="teal">{line}</Text>;
                }
              })}
            </div>
          ) : (
            <Lottie
                    animationData={anim}
                    style={{ width: "100px", height: "100px" }}
                  />
          )}
        </Center>
      </Paper>
    </>
  );
};

export default UserPage;
