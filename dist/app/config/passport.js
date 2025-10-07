"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const user_model_1 = __importDefault(require("../modules/user/user.model"));
const user_interface_1 = require("../modules/user/user.interface");
const passport_local_1 = require("passport-local");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isUserExist = yield user_model_1.default.findOne({ email });
        // if (!isUserExist) {
        //   return done(null, false, { message: "User does not exist" });
        // }
        if (!isUserExist) {
            return done("User does not exist");
        }
        const isGoogleAuthenticated = isUserExist.auths.some((providerObjects) => providerObjects.provider === "google");
        if (isGoogleAuthenticated) {
            return done(null, false, {
                message: "You have already logged in with Google. So if you want to login with credentials, then first login with Google and set a password for your gmail account and then you can login with email and password.",
            });
        }
        // if (isGoogleAuthenticated) {
        //   done(
        //     "User already logged in with Google. So if you want to login with credentials, then first login with Google and set a password for your gmail account and then you can login with email and password."
        //   );
        // }
        const isPasswordMatched = yield bcryptjs_1.default.compare(password, isUserExist.password);
        if (!isPasswordMatched) {
            done(null, false, { message: "Password does not match!" });
        }
        return done(null, isUserExist);
    }
    catch (error) {
        console.log(error);
        done(error);
    }
})));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.envVars.GOOGLE_CLIENT_ID,
    clientSecret: env_1.envVars.GOOGLE_CLIENT_SECRET,
    callbackURL: env_1.envVars.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        if (!email) {
            return done(null, false, { message: "No email found" });
        }
        let user = yield user_model_1.default.findOne({ email });
        if (!user) {
            // Parse state to get role
            let role = user_interface_1.Role.SENDER; // Default fallback
            try {
                const state = req.query.state;
                if (state) {
                    const parsedState = JSON.parse(state);
                    role = parsedState.role || user_interface_1.Role.SENDER;
                }
            }
            catch (e) {
                // If state parsing fails, use default SENDER role
                console.log("State parsing error, using default SENDER role", e);
            }
            user = yield user_model_1.default.create({
                email,
                name: profile.displayName,
                picture: (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0].value,
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
    }
    catch (error) {
        console.log("google strategy error", error);
        return done(error);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(id);
        done(null, user);
    }
    catch (error) {
        console.log("deserializeUser error", error);
        done(error);
    }
}));
