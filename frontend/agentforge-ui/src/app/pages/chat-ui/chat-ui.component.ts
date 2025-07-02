// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ToolService } from '../../services/tool.service';
// @Component({
//   selector: 'app-chat-ui',
//   imports: [FormsModule, CommonModule],
//   templateUrl: './chat-ui.component.html',
//   styleUrl: './chat-ui.component.css'
// })
// // export class ChatUiComponent implements OnInit {
// //   constructor(private toolService: ToolService) { }
// //   result: any;
// //   task: string = '';
// //   toolParams: any[] = [];
// //   args: any = {};
// //   loading = false;
// //   ngOnInit(): void {
// //     // this.executeTask();
// //   }
// //   executeTask() {
// //   if (!this.task.trim() || this.loading) return;

// //   this.loading = true;

// //   this.toolService.callAPI(this.task, this.args)
// //     .subscribe({
// //       next: (res: any) => {
// //         this.result = res.result;

// //         // If it's a newly created tool, update params
// //         if (!res.used_existing && res.tool) {
// //           this.toolService.getTools().subscribe((toolRes: any) => {
// //             const tool = toolRes.tools[res.tool];
// //             this.toolParams = tool?.params || [];
// //           });
// //         }

// //         this.loading = false;
// //       },
// //       error: (err) => {
// //         console.error("❌ API error:", err);
// //         this.result = "An error occurred.";
// //         this.loading = false;
// //       }
// //     });
// // }

// //   execute() {
// //   }
// // }
// export class ChatUiComponent implements OnInit {
//   constructor(private toolService: ToolService) {}

//   task: string = '';
//   args: any = {};
//   toolParams: any[] = [];
//   loading = false;

//   chatHistory: { sender: 'user' | 'agent', text: string }[] = [];

//   ngOnInit(): void {}

//   executeTask() {
//     if (!this.task.trim() || this.loading) return;

//     this.loading = true;

//     // Add user's message to chat
//     this.chatHistory.push({ sender: 'user', text: this.task });

//     this.toolService.callAPI(this.task, this.args).subscribe({
//       next: (res: any) => {
//         const agentResponse = res.result || '✅ Task completed, no response.';
//         this.chatHistory.push({ sender: 'agent', text: agentResponse });

//         // Optionally update params if tool was newly generated
//         if (!res.used_existing && res.tool) {
//           this.toolService.getTools().subscribe((toolRes: any) => {
//             const tool = toolRes.tools[res.tool];
//             this.toolParams = tool?.params || [];
//           });
//         }

//         // Reset
//         this.task = '';
//         this.args = {};
//         this.loading = false;
//       },
//       error: (err) => {
//         console.error("❌ API error:", err);
//         this.chatHistory.push({ sender: 'agent', text: "❌ An error occurred while executing the task." });
//         this.loading = false;
//       }
//     });
//   }
// }






// import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ToolService } from '../../services/tool.service';

// interface Message {
//   sender: 'user' | 'agent' | 'system';
//   text: string;
//   timestamp: Date;
//   isError?: boolean;
// }

// interface ParameterInput {
//   name: string;
//   type: string;
//   value: any;
//   placeholder?: string;
// }

// @Component({
//   selector: 'app-chat-ui',
//   imports: [FormsModule, CommonModule],
//   templateUrl: './chat-ui.component.html',
//   styleUrl: './chat-ui.component.css'
// })
// export class ChatUiComponent implements OnInit {
//   @ViewChild('chatThread') chatThread!: ElementRef;

//   task: string = '';
//   loading = false;
//   chatHistory: Message[] = [];
  
//   // Parameter handling
//   waitingForParams = false;
//   currentToolName = '';
//   requiredParams: ParameterInput[] = [];
//   paramValues: any = {};
//   originalTask = '';

//   constructor(private toolService: ToolService) {}

//   ngOnInit(): void {
//     this.addSystemMessage("👋 Hi! I'm AgentForge. I can help you with any task by creating specialized tools on demand. Just tell me what you need!");
//   }

//   executeTask() {
//     if (!this.task.trim() || this.loading) return;

//     const userTask = this.task.trim();
//     this.task = '';
//     this.loading = true;

//     // Add user's message
//     this.addUserMessage(userTask);

//     // First attempt with empty args
//     this.attemptExecution(userTask, {});
//   }

//   attemptExecution(task: string, args: any) {
//     this.toolService.callAPI(task, args).subscribe({
//       next: (res: any) => {
//         this.loading = false;

//         // Check if the result indicates missing parameters
//         if (res.result && this.isMissingParamError(res.result)) {
//           this.handleMissingParameters(task, res);
//         } else {
//           // Success!
//           this.addAgentMessage(res.result || '✅ Task completed successfully!');
          
//           // Show what tool was used
//           if (res.tool) {
//             const action = res.used_existing ? 'used existing' : 'created new';
//             this.addSystemMessage(`🔧 I ${action} tool: ${res.tool}`);
//           }
//         }
//       },
//       error: (err) => {
//         console.error("❌ API error:", err);
//         this.loading = false;
//         this.addAgentMessage("❌ Sorry, I encountered an error. Please try rephrasing your request.", true);
//       }
//     });
//   }

//   isMissingParamError(result: string): boolean {
//     return result.includes("Missing required parameter") || 
//            result.includes("Please provide") ||
//            result.includes("required parameter");
//   }

//   handleMissingParameters(task: string, response: any) {
//     // Extract parameter info from error message
//     const paramInfo = this.extractParameterInfo(response.result);
    
//     if (paramInfo.length > 0) {
//       this.waitingForParams = true;
//       this.originalTask = task;
//       this.currentToolName = response.tool || '';
//       this.requiredParams = paramInfo;
      
//       // Initialize param values
//       this.paramValues = {};
//       paramInfo.forEach(p => {
//         this.paramValues[p.name] = '';
//       });

//       this.addSystemMessage(`📝 I need some information to complete this task:`);
//     } else {
//       // Couldn't parse parameters, ask generically
//       this.addAgentMessage("I need additional information to complete this task. Could you be more specific?");
//     }
//   }

//   extractParameterInfo(errorMessage: string): ParameterInput[] {
//     const params: ParameterInput[] = [];
    
//     // Try to extract parameter name from error message
//     const paramMatch = errorMessage.match(/parameter:\s*'(\w+)'/);
//     if (paramMatch) {
//       const paramName = paramMatch[1];
//       params.push({
//         name: paramName,
//         type: 'string',
//         value: '',
//         placeholder: `Enter ${paramName}`
//       });
//     }

//     // If we have a tool, try to get its params from registry
//     if (this.currentToolName) {
//       this.toolService.getTools().subscribe((toolRes: any) => {
//         const tool = toolRes.tools[this.currentToolName];
//         if (tool?.params) {
//           this.requiredParams = tool.params.map((p: any) => ({
//             name: p.name,
//             type: p.type || 'string',
//             value: '',
//             placeholder: `Enter ${p.name} (${p.type})`
//           }));
//         }
//       });
//     }

//     return params;
//   }

//   submitWithParameters() {
//     if (!this.allParamsProvided()) {
//       this.addSystemMessage("⚠️ Please fill in all required parameters.");
//       return;
//     }

//     this.waitingForParams = false;
//     this.loading = true;

//     // Show what params are being sent
//     const paramDisplay = Object.entries(this.paramValues)
//       .map(([key, value]) => `${key}: ${value}`)
//       .join(', ');
//     this.addUserMessage(`Using parameters: ${paramDisplay}`);

//     // Retry with parameters
//     this.attemptExecution(this.originalTask, this.paramValues);

//     // Reset
//     this.requiredParams = [];
//     this.paramValues = {};
//   }

//   cancelParameters() {
//     this.waitingForParams = false;
//     this.requiredParams = [];
//     this.paramValues = {};
//     this.addSystemMessage("❌ Parameter input cancelled.");
//   }

//   allParamsProvided(): boolean {
//     return this.requiredParams.every(p => 
//       this.paramValues[p.name] !== undefined && 
//       this.paramValues[p.name] !== ''
//     );
//   }

//   // Message helpers
//   addUserMessage(text: string) {
//     this.chatHistory.push({
//       sender: 'user',
//       text: text,
//       timestamp: new Date()
//     });
//     this.scrollToBottom();
//   }

//   addAgentMessage(text: string, isError: boolean = false) {
//     this.chatHistory.push({
//       sender: 'agent',
//       text: text,
//       timestamp: new Date(),
//       isError: isError
//     });
//     this.scrollToBottom();
//   }

//   addSystemMessage(text: string) {
//     this.chatHistory.push({
//       sender: 'system',
//       text: text,
//       timestamp: new Date()
//     });
//     this.scrollToBottom();
//   }

//   scrollToBottom() {
//     setTimeout(() => {
//       if (this.chatThread) {
//         const element = this.chatThread.nativeElement;
//         element.scrollTop = element.scrollHeight;
//       }
//     }, 100);
//   }

//   // Quick action buttons
//   quickActions = [
//     { icon: '🌤️', text: 'Weather', task: 'What is the weather in New York?' },
//     { icon: '🧮', text: 'Calculate', task: 'Calculate the area of a circle with radius 5' },
//     { icon: '💱', text: 'Convert', task: 'Convert 100 USD to EUR' },
//     { icon: '🎲', text: 'Random', task: 'Generate a random number between 1 and 100' }
//   ];

//   sendQuickAction(task: string) {
//     this.task = task;
//     this.executeTask();
//   }

//   handleKeyPress(event: KeyboardEvent) {
//     if (event.key === 'Enter' && !event.shiftKey) {
//       event.preventDefault();
//       this.executeTask();
//     }
//   }

//   // Add these methods to your ChatUiComponent class:

//   formatMessage(text: string): string {
//     // Convert line breaks to <br>
//     let formatted = text.replace(/\n/g, '<br>');
    
//     // Convert URLs to links
//     formatted = formatted.replace(
//       /(https?:\/\/[^\s]+)/g, 
//       '<a href="$1" target="_blank" rel="noopener">$1</a>'
//     );
    
//     // Highlight code blocks with backticks
//     formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
//     // Highlight important markers
//     formatted = formatted.replace(/✅/g, '<span style="color: #4CAF50;">✅</span>');
//     formatted = formatted.replace(/❌/g, '<span style="color: #f44336;">❌</span>');
//     formatted = formatted.replace(/⚠️/g, '<span style="color: #ff9800;">⚠️</span>');
//     formatted = formatted.replace(/🔧/g, '<span style="color: #2196F3;">🔧</span>');
    
//     return formatted;
//   }

//   getInputType(type: string): string {
//     switch(type.toLowerCase()) {
//       case 'number':
//       case 'float':
//       case 'int':
//       case 'integer':
//         return 'number';
//       case 'email':
//         return 'email';
//       case 'url':
//         return 'url';
//       case 'date':
//         return 'date';
//       default:
//         return 'text';
//     }
//   }

//   // You can also add these example tasks as a property:
//   exampleTasks = [
//     "What's the weather in Tokyo?",
//     "Calculate the compound interest for $1000 at 5% for 10 years",
//     "Convert 50 kilometers to miles",
//     "Generate a secure password with 16 characters",
//     "What's the current price of Bitcoin?",
//     "Translate 'Hello World' to Spanish",
//     "Calculate my BMI if I'm 180cm tall and weigh 75kg",
//     "What time is it in London?",
//     "Find the distance between New York and Los Angeles",
//     "Generate a random joke"
//   ];
// }


import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';

interface Message {
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

interface ParameterInput {
  name: string;
  type: string;
  value: any;
  placeholder?: string;
}

@Component({
  selector: 'app-chat-ui',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-ui.component.html',
  styleUrl: './chat-ui.component.css'
})
export class ChatUiComponent implements OnInit {
  @ViewChild('chatThread') chatThread!: ElementRef;

  task: string = '';
  loading = false;
  chatHistory: Message[] = [];
  
  // Parameter handling
  waitingForParams = false;
  currentToolName = '';
  requiredParams: ParameterInput[] = [];
  paramValues: any = {};
  originalTask = '';

  constructor(private toolService: ToolService) {}

  ngOnInit(): void {
    this.addSystemMessage("👋 Hi! I'm AgentForge. I can help you with any task by creating specialized tools on demand. Just tell me what you need!");
  }

  executeTask() {
    if (!this.task.trim() || this.loading) return;

    const userTask = this.task.trim();
    this.task = '';
    this.loading = true;

    // Add user's message
    this.addUserMessage(userTask);

    // First attempt with empty args
    this.attemptExecution(userTask, {});
  }

  attemptExecution(task: string, args: any) {
    debugger;
    this.toolService.callAPI(task, args).subscribe({
      next: (res: any) => {
        this.loading = false;

        // Check if the result indicates missing parameters
        if (res.result && this.isMissingParamError(res.result)) {
          this.handleMissingParameters(task, res);
        } else {
          // Success!
          this.addAgentMessage(res.result || '✅ Task completed successfully!');
          
          // Show what tool was used
          if (res.tool) {
            const action = res.used_existing ? 'used existing' : 'created new';
            this.addSystemMessage(`🔧 I ${action} tool: ${res.tool}`);
          }
        }
      },
      error: (err) => {
        console.error("❌ API error:", err);
        this.loading = false;
        this.addAgentMessage("❌ Sorry, I encountered an error. Please try rephrasing your request.", true);
      }
    });
  }

  isMissingParamError(result: string): boolean {
    return result.includes("Missing required parameter") || 
           result.includes("Please provide") ||
           result.includes("required parameter");
  }

  handleMissingParameters(task: string, response: any) {
    // Extract parameter info from error message
    const paramInfo = this.extractParameterInfo(response.result);
    
    if (paramInfo.length > 0) {
      this.waitingForParams = true;
      this.originalTask = task;
      this.currentToolName = response.tool || '';
      this.requiredParams = paramInfo;
      
      // Initialize param values
      this.paramValues = {};
      paramInfo.forEach(p => {
        this.paramValues[p.name] = '';
      });

      this.addSystemMessage(`📝 I need some information to complete this task:`);
    } else {
      // Couldn't parse parameters, ask generically
      this.addAgentMessage("I need additional information to complete this task. Could you be more specific?");
    }
  }

  extractParameterInfo(errorMessage: string): ParameterInput[] {
    const params: ParameterInput[] = [];
    
    // Try to extract parameter name from error message
    const paramMatch = errorMessage.match(/parameter:\s*'(\w+)'/);
    if (paramMatch) {
      const paramName = paramMatch[1];
      params.push({
        name: paramName,
        type: 'string',
        value: '',
        placeholder: `Enter ${paramName}`
      });
    }

    // If we have a tool, try to get its params from registry
    if (this.currentToolName) {
      this.toolService.getTools().subscribe((toolRes: any) => {
        const tool = toolRes.tools[this.currentToolName];
        if (tool?.params) {
          this.requiredParams = tool.params.map((p: any) => ({
            name: p.name,
            type: p.type || 'string',
            value: '',
            placeholder: `Enter ${p.name} (${p.type})`
          }));
        }
      });
    }

    return params;
  }

  submitWithParameters() {
    if (!this.allParamsProvided()) {
      this.addSystemMessage("⚠️ Please fill in all required parameters.");
      return;
    }

    this.waitingForParams = false;
    this.loading = true;

    // Show what params are being sent
    const paramDisplay = Object.entries(this.paramValues)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    this.addUserMessage(`Using parameters: ${paramDisplay}`);

    // Retry with parameters
    this.attemptExecution(this.originalTask, this.paramValues);

    // Reset
    this.requiredParams = [];
    this.paramValues = {};
  }

  cancelParameters() {
    this.waitingForParams = false;
    this.requiredParams = [];
    this.paramValues = {};
    this.addSystemMessage("❌ Parameter input cancelled.");
  }

  allParamsProvided(): boolean {
    return this.requiredParams.every(p => 
      this.paramValues[p.name] !== undefined && 
      this.paramValues[p.name] !== ''
    );
  }

  // Message helpers
  addUserMessage(text: string) {
    this.chatHistory.push({
      sender: 'user',
      text: text,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  addAgentMessage(text: string, isError: boolean = false) {
    this.chatHistory.push({
      sender: 'agent',
      text: text,
      timestamp: new Date(),
      isError: isError
    });
    this.scrollToBottom();
  }

  addSystemMessage(text: string) {
    this.chatHistory.push({
      sender: 'system',
      text: text,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatThread) {
        const element = this.chatThread.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  // Quick action buttons
  quickActions = [
    { icon: '🌤️', text: 'Weather', task: 'What is the weather in New York?' },
    { icon: '🧮', text: 'Calculate', task: 'Calculate the area of a circle with radius 5' },
    { icon: '💱', text: 'Convert', task: 'Convert 100 USD to EUR' },
    { icon: '🎲', text: 'Random', task: 'Generate a random number between 1 and 100' }
  ];

  sendQuickAction(task: string) {
    this.task = task;
    this.executeTask();
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.executeTask();
    }
  }

  // Example tasks for welcome screen
  exampleTasks = [
    "What's the weather in Tokyo?",
    "Calculate compound interest",
    "Convert 50 km to miles",
    "Generate a secure password",
    "What's the Bitcoin price?",
    "Translate Hello to Spanish",
    "Calculate my BMI",
    "What time is it in London?",
    "Find distance between cities",
    "Tell me a joke"
  ];

  // Format message with HTML
  formatMessage(text: string): string {
    // Convert line breaks to <br>
    let formatted = text.replace(/\n/g, '<br>');
    
    // Convert URLs to links
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );
    
    // Highlight code blocks with backticks
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Highlight important markers
    formatted = formatted.replace(/✅/g, '<span style="color: #4CAF50;">✅</span>');
    formatted = formatted.replace(/❌/g, '<span style="color: #f44336;">❌</span>');
    formatted = formatted.replace(/⚠️/g, '<span style="color: #ff9800;">⚠️</span>');
    formatted = formatted.replace(/🔧/g, '<span style="color: #2196F3;">🔧</span>');
    
    return formatted;
  }

  // Get input type based on parameter type
  getInputType(type: string): string {
    switch(type.toLowerCase()) {
      case 'number':
      case 'float':
      case 'int':
      case 'integer':
        return 'number';
      case 'email':
        return 'email';
      case 'url':
        return 'url';
      case 'date':
        return 'date';
      default:
        return 'text';
    }
  }
}