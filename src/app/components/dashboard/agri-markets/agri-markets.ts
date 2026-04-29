import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Farm } from '../../../models/farm.model';
import { FarmService } from '../../../services/farm.service';

@Component({
  selector: 'app-agri-markets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './agri-markets.html',
  styleUrl: './agri-markets.css',
})
export class AgriMarkets {
  searchQuery = '';
  results: Farm[] = [];
  searched = false;
  loading = false;
  errorMessage = '';

  constructor(private readonly farmService: FarmService) {}

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.errorMessage = 'Please enter a search term.';
      return;
    }

    this.loading = true;
    this.searched = false;
    this.errorMessage = '';
    this.results = [];

    this.farmService.searchFarms(this.searchQuery).subscribe({
      next: (data) => {
        this.results = data;
        this.searched = true;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Search failed. Please try again.';
        this.loading = false;
        this.searched = true;
      },
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.results = [];
    this.searched = false;
    this.errorMessage = '';
  }
}
