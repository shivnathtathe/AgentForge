import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  apiStatus: 'online' | 'offline' = 'offline';

  constructor(private toolService: ToolService) {}

  ngOnInit() {
    this.checkApiStatus();
    // Check status every 30 seconds
    setInterval(() => this.checkApiStatus(), 30000);
  }

  checkApiStatus() {
    this.toolService.getTools().subscribe({
      next: () => {
        this.apiStatus = 'online';
      },
      error: () => {
        this.apiStatus = 'offline';
      }
    });
  }

  showStats() {
    this.toolService.getTools().subscribe({
      next: (response) => {
        const tools = response.tools || {};
        const toolCount = Object.keys(tools).length;
        
        // Calculate total executions
        let totalExecutions = 0;
        let avgSuccessRate = 0;
        let successRates: number[] = [];
        
        Object.values(tools).forEach((tool: any) => {
          totalExecutions += tool.usage_count || 0;
          if (tool.success_rate !== undefined) {
            successRates.push(tool.success_rate);
          }
        });
        
        if (successRates.length > 0) {
          avgSuccessRate = successRates.reduce((a, b) => a + b, 0) / successRates.length;
        }
        
        // Create stats message
        const statsMessage = `
📊 AgentForge Statistics
========================
🔧 Total Tools: ${toolCount}
⚡ Total Executions: ${totalExecutions}
✅ Avg Success Rate: ${(avgSuccessRate * 100).toFixed(1)}%

Top Tools:
${Object.entries(tools)
  .sort((a: any, b: any) => (b[1].usage_count || 0) - (a[1].usage_count || 0))
  .slice(0, 5)
  .map(([name, data]: [string, any]) => `• ${name}: ${data.usage_count || 0} uses`)
  .join('\n')}
        `;
        
        alert(statsMessage);
      },
      error: () => {
        alert('❌ Failed to load statistics');
      }
    });
  }

  showTools() {
    this.toolService.getTools().subscribe({
      next: (response) => {
        const tools = response.tools || {};
        const toolCount = Object.keys(tools).length;
        
        if (toolCount === 0) {
          alert('📋 No tools created yet!\n\nStart by typing any task in the chat.');
          return;
        }
        
        const toolList = Object.entries(tools)
          .map(([name, data]: [string, any]) => {
            const uses = data.usage_count || 0;
            const rate = data.success_rate ? `${(data.success_rate * 100).toFixed(0)}%` : 'N/A';
            return `• ${name}\n  ${data.description}\n  Uses: ${uses} | Success: ${rate}`;
          })
          .join('\n\n');
        
        const toolsMessage = `
🔧 Available Tools (${toolCount})
============================

${toolList}
        `;
        
        alert(toolsMessage);
      },
      error: () => {
        alert('❌ Failed to load tools');
      }
    });
  }
}