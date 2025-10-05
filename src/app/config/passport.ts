/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { envVars } from "./env";
import User from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from "bcryptjs";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await User.findOne({ email });

        // if (!isUserExist) {
        //   return done(null, false, { message: "User does not exist" });
        // }

        if (!isUserExist) {
          return done("User does not exist");
        }

        const isGoogleAuthenticated = isUserExist.auths.some(
          (providerObjects) => (providerObjects.provider === "google")
        );

        if (isGoogleAuthenticated) {
          return done(null, false, {
            message:
              "You have already logged in with Google. So if you want to login with credentials, then first login with Google and set a password for your gmail account and then you can login with email and password.",
          });
        }
        // if (isGoogleAuthenticated) {
        //   done(
        //     "User already logged in with Google. So if you want to login with credentials, then first login with Google and set a password for your gmail account and then you can login with email and password."
        //   );
        // }

        const isPasswordMatched = await bcryptjs.compare(
          password as string,
          isUserExist.password as string
        );

        if (!isPasswordMatched) {
          done(null, false, { message: "Password does not match!" });
        }

        return done(null, isUserExist);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0].value;

        if (!email) {
          return done(null, false, { message: "No email found" });
        }

        let user = await User.findOne({ email });

        if (!user) {
          // Parse state to get role
          let role = Role.SENDER; // Default fallback
          try {
            const state = req.query.state;
            if (state) {
              const parsedState = JSON.parse(state);
              role = parsedState.role || Role.SENDER;
            }
          } catch (e) {
            // If state parsing fails, use default SENDER role
            console.log("State parsing error, using default SENDER role");
          }

          user = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            role: role,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }

        return done(null, user);
      } catch (error) {
        console.log("google strategy error", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(
  async (id: string, done: (err: any, user?: any) => void) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      console.log("deserializeUser error", error);
      done(error);
    }
  }
);
