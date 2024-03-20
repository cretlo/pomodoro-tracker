"use client";

import { useToast } from "@/components/ui/use-toast";
import { mapSettingsToState, mapUserSettingsFormDataToState, secondsToTimeUnits, timeUnitsToSeconds } from "@/lib/utils";
import { TimeUnits, UserSettings, UserSettingsState } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useReducer } from "react";
import { useAuthContext } from "./auth-context";
import axiosInstance from "@/api/axiosInstance";
import { UserSettingsFormData } from "@/validation_schema/schemas";


type UserContextProviderProps = {
	children: React.ReactNode
}


const initialTaskTimeUnits = { hours: 0, mins: 0, secs: 4 };
const initialShortBreakTimeUnits = { hours: 0, mins: 0, secs: 2 };
const initialLongBreakTimeUnits = { hours: 0, mins: 0, secs: 5 };
const initialState: UserSettingsState = {
	taskTimeUnits: initialTaskTimeUnits,
	shortBreakTimeUnits: initialShortBreakTimeUnits,
	longBreakTimeUnits: initialLongBreakTimeUnits,
	taskSeconds: timeUnitsToSeconds(initialTaskTimeUnits),
	shortBreakSeconds: timeUnitsToSeconds(initialShortBreakTimeUnits),
	longBreakSeconds: timeUnitsToSeconds(initialLongBreakTimeUnits),
	pomodoroInterval: 4
}

interface UserSettingsContextType {
	taskSeconds: number;
	shortBreakSeconds: number;
	longBreakSeconds: number;
	taskTimeUnits: TimeUnits;
	shortBreakTimeUnits: TimeUnits;
	longBreakTimeUnits: TimeUnits;
	pomodoroInterval: number;
	updateSettings: (newSettings: UserSettingsFormData) => void
}

type ACTIONTYPE =
	| { type: "update_settings", payload: UserSettingsState }
	| { type: "default_settings" }

function reducer(state: UserSettingsState, action: ACTIONTYPE): UserSettingsState {
	switch (action.type) {
		case "default_settings":
			return initialState;
		case "update_settings":
			return action.payload;
	}
}

export const UserSettingsContext = createContext<UserSettingsContextType | null>(null);

export default function UserSettingsContextProvider({ children }: UserContextProviderProps) {
	const { isAuthenticated, user } = useAuthContext();
	const [state, dispatch] = useReducer(reducer, initialState);
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const {
		taskSeconds,
		shortBreakSeconds,
		longBreakSeconds,
		taskTimeUnits,
		shortBreakTimeUnits,
		longBreakTimeUnits,
		pomodoroInterval
	} = state;

	const { data: userSettings, isLoading, error } = useQuery({
		queryKey: ["userSettings"],
		queryFn: async () => {
			const response = await axiosInstance.get("/settings");
			return response.data as UserSettings;
		},
		enabled: isAuthenticated(),
	})

	const mutation = useMutation({
		mutationFn: async (newSettings: UserSettings) => {
			const response = await axiosInstance.put("/settings", newSettings);
			return response.data as UserSettings;
		},
		onError: (error) => {
			console.log(error);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['userSettings'] })
		},
	})

	// Even though we can just use react query's context, sharing state
	// allows unauthenticted users to still use the app
	useEffect(() => {
		if (userSettings) {
			dispatch({
				type: "update_settings",
				payload: mapSettingsToState(userSettings)
			})
			toast({
				description: "Your settings are now synced"
			})
		} else {
			dispatch({
				type: "default_settings",
			})
		}

		if (error) {
			console.log(error);
		}

	}, [userSettings]);


	useEffect(() => {
		if (isAuthenticated() && user) {

			dispatch({
				type: "update_settings",
				payload: {
					taskSeconds,
					shortBreakSeconds,
					longBreakSeconds,
					shortBreakTimeUnits: secondsToTimeUnits(shortBreakSeconds),
					longBreakTimeUnits: secondsToTimeUnits(longBreakSeconds),
					taskTimeUnits: secondsToTimeUnits(taskSeconds),
					pomodoroInterval
				}
			})
		}
	}, [isAuthenticated]);


	function updateSettings(newSettings: UserSettingsFormData) {
		const newState = mapUserSettingsFormDataToState(newSettings);

		if (!isAuthenticated()) {
			dispatch({
				type: "update_settings",
				payload: newState
			});
			return;
		}

		mutation.mutate({
			taskSeconds: newState.taskSeconds,
			shortBreakSeconds: newState.shortBreakSeconds,
			longBreakSeconds: newState.longBreakSeconds,
			pomodoroInterval: newState.pomodoroInterval
		})
	}

	const contextValue: UserSettingsContextType = {
		taskSeconds,
		shortBreakSeconds,
		longBreakSeconds,
		taskTimeUnits,
		shortBreakTimeUnits,
		longBreakTimeUnits,
		pomodoroInterval,
		updateSettings
	}

	return (
		<UserSettingsContext.Provider value={contextValue}>
			{!isLoading && children}
		</UserSettingsContext.Provider>
	)
}

export function useUserSettingsContext() {
	const context = useContext(UserSettingsContext);

	if (!context) {
		throw new Error("useUserContext must be used within a UserContextProvider");
	}

	return context;
}
