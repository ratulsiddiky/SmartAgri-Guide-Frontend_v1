import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { FarmService } from '../../../services/farm.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  authService = inject(AuthService);
  farmService = inject(FarmService);

  totalFarms = 0;
  isLoadingStats = true;

  get greetingName(): string {
    const user = this.authService.currentUserSignal();
    return user?.username || 'Farmer';
  }

  ngOnInit() {
    this.isLoadingStats = true;
    this.farmService.getFarms(1, 1).subscribe({
      next: (res) => {
        this.totalFarms = res.pagination?.total || 0;
        this.isLoadingStats = false;
      },
      error: (err) => {
        console.error('Stats load failed', err);
        this.totalFarms = 0;
        this.isLoadingStats = false;
      }
    });
  }
}