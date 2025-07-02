import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  toolCount: number = 0;
  executionCount: number = 0;

  constructor(private toolService: ToolService) {}

  ngOnInit() {
    this.loadStats();
    // Refresh stats every minute
    setInterval(() => this.loadStats(), 60000);
  }

  loadStats() {
    this.toolService.getTools().subscribe({
      next: (response) => {
        const tools = response.tools || {};
        this.toolCount = Object.keys(tools).length;
        
        // Calculate total executions
        this.executionCount = Object.values(tools).reduce((total: number, tool: any) => {
          return total + (tool.usage_count || 0);
        }, 0);
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
        // Keep previous values on error
      }
    });
  }
}