package org.opensourcecommunity.pomodoroapp.controllers;

import java.util.List;

import org.opensourcecommunity.pomodoroapp.dtos.PomodoroSessionAllTimeDto;
import org.opensourcecommunity.pomodoroapp.dtos.PomodoroSessionTodayOverviewDto;
import org.opensourcecommunity.pomodoroapp.dtos.PomodoroSessionWeeklyDto;
import org.opensourcecommunity.pomodoroapp.models.User;
import org.opensourcecommunity.pomodoroapp.services.PomodoroSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pomodoro-sessions/analytics")
public class PomodoroAnalyticsController {

	private final PomodoroSessionService pomodoroSessionService;

	PomodoroAnalyticsController(PomodoroSessionService pomodoroSessionService) {
		this.pomodoroSessionService = pomodoroSessionService;
	}

	@GetMapping("/today-totals")
	public ResponseEntity<?> getTodayTotals(Authentication auth) {
		User user = (User) auth.getPrincipal();
		PomodoroSessionTodayOverviewDto dailtyTotal = pomodoroSessionService.getTodayTotals(user);

		return ResponseEntity.ok(dailtyTotal);
	}

	@GetMapping("/all-time-totals")
	public ResponseEntity<?> getAllTimeTotals(Authentication auth) {
		User user = (User) auth.getPrincipal();
		PomodoroSessionAllTimeDto dailtyTotal = pomodoroSessionService.getAllTimeTotals(user);

		return ResponseEntity.ok(dailtyTotal);
	}

	@GetMapping("/current-week")
	public ResponseEntity<?> getCurrentWeekAnalytics(Authentication auth) {
		User user = (User) auth.getPrincipal();
		List<PomodoroSessionWeeklyDto> currentWeekAnalytics = pomodoroSessionService
				.getCurrentWeeklyAnalytics(user);

		return ResponseEntity.ok(currentWeekAnalytics);
	}

}
