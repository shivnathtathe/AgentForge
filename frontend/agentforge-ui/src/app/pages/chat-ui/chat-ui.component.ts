import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
@Component({
  selector: 'app-chat-ui',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-ui.component.html',
  styleUrl: './chat-ui.component.css'
})
// export class ChatUiComponent implements OnInit {
//   constructor(private toolService: ToolService) { }
//   result: any;
//   task: string = '';
//   toolParams: any[] = [];
//   args: any = {};
//   loading = false;
//   ngOnInit(): void {
//     // this.executeTask();
//   }
//   executeTask() {
//   if (!this.task.trim() || this.loading) return;

//   this.loading = true;

//   this.toolService.callAPI(this.task, this.args)
//     .subscribe({
//       next: (res: any) => {
//         this.result = res.result;

//         // If it's a newly created tool, update params
//         if (!res.used_existing && res.tool) {
//           this.toolService.getTools().subscribe((toolRes: any) => {
//             const tool = toolRes.tools[res.tool];
//             this.toolParams = tool?.params || [];
//           });
//         }

//         this.loading = false;
//       },
//       error: (err) => {
//         console.error("❌ API error:", err);
//         this.result = "An error occurred.";
//         this.loading = false;
//       }
//     });
// }

//   execute() {
//   }
// }
export class ChatUiComponent implements OnInit {
  constructor(private toolService: ToolService) {}

  task: string = '';
  args: any = {};
  toolParams: any[] = [];
  loading = false;

  chatHistory: { sender: 'user' | 'agent', text: string }[] = [];

  ngOnInit(): void {}

  executeTask() {
    if (!this.task.trim() || this.loading) return;

    this.loading = true;

    // Add user's message to chat
    this.chatHistory.push({ sender: 'user', text: this.task });

    this.toolService.callAPI(this.task, this.args).subscribe({
      next: (res: any) => {
        const agentResponse = res.result || '✅ Task completed, no response.';
        this.chatHistory.push({ sender: 'agent', text: agentResponse });

        // Optionally update params if tool was newly generated
        if (!res.used_existing && res.tool) {
          this.toolService.getTools().subscribe((toolRes: any) => {
            const tool = toolRes.tools[res.tool];
            this.toolParams = tool?.params || [];
          });
        }

        // Reset
        this.task = '';
        this.args = {};
        this.loading = false;
      },
      error: (err) => {
        console.error("❌ API error:", err);
        this.chatHistory.push({ sender: 'agent', text: "❌ An error occurred while executing the task." });
        this.loading = false;
      }
    });
  }
}