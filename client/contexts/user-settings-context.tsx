"use client";

import { useToast } from "@/components/ui/use-toast";
import { mapSettingsToState, mapUserSettingsFormDataToState, secondsToTimeUnits, timeUnitsToSeconds } from "@/lib/utils";
import { TimeUnitNums, UserSettings, UserSettingsState } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useReducer } from "react";
import { useAuthContext } from "./auth-context";
import axiosInstance from "@/api/axiosInstance";
import { UserSettingsFormData } from "@/validation_schema/schemas";


type UserContextProviderProps = {
	children: React.ReactNode
}


const initialTaskTimeUnits = { hours: 0, mins: 25, secs: 0 };
const initialShortBreakTimeUnits = { hours: 0, mins: 10, secs: 0 };
const initialLongBreakTimeUnits = { hours: 0, mins: 20, secs: 0 };
const initialState: UserSettingsState = {
	taskTimeUnits: initialTaskTimeUnits,
	shortBreakTimeUnits: initialShortBreakTimeUnits,
	longBreakTimeUnits: initialLongBreakTimeUnits,
	taskSeconds: timeUnitsToSeconds(initialTaskTimeUnits),
	shortBreakSeconds: timeUnitsToSeconds(initialShortBreakTimeUnits),
	longBreakSeconds: timeUnitsToSeconds(initialLongBreakTimeUnits),
	pomodoroInterval: 4,
	sound: "bells"
}

interface UserSettingsContextType {
	taskSeconds: number;
	shortBreakSeconds: number;
	longBreakSeconds: number;
	taskTimeUnits: TimeUnitNums;
	shortBreakTimeUnits: TimeUnitNums;
	longBreakTimeUnits: TimeUnitNums;
	pomodoroInterval: number;
	sound: string;
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
		pomodoroInterval,
		sound
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
			toast({
				description: error.message,
			})
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
			toast({
				description: error.message,
			})
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
					shortBreakTimeUnits: secondsToTimeUnits(shortBreakSeconds, false),
					longBreakTimeUnits: secondsToTimeUnits(longBreakSeconds, false),
					taskTimeUnits: secondsToTimeUnits(taskSeconds, false),
					pomodoroInterval,
					sound
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
			pomodoroInterval: newState.pomodoroInterval,
			sound: newState.sound
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
		sound,
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
