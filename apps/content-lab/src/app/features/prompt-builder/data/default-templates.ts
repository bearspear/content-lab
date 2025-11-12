/**
 * Default Prompt Templates
 * 25 curated templates organized by category
 */

import { PromptTemplate, TemplateCategory } from '../models/template.model';

export const DEFAULT_TEMPLATES: PromptTemplate[] = [
  // ========================================
  // Role-Based Prompts (5)
  // ========================================
  {
    id: 'code-review-assistant',
    name: 'Code Review Assistant',
    description: 'Expert code reviewer providing thorough analysis and constructive feedback',
    category: TemplateCategory.RoleBased,
    tags: ['code', 'review', 'development', 'quality'],
    systemPrompt: 'You are an experienced software engineer specializing in code review. You provide thorough, constructive feedback on code quality, security, performance, and best practices. Your reviews are detailed but respectful, helping developers improve their skills.',
    userPrompt: 'Please review the following {{language}} code:\n\n```{{language}}\n{{code}}\n```\n\nFocus on:\n- Code quality and readability\n- Potential bugs or edge cases\n- Security vulnerabilities\n- Performance optimizations\n- Best practices and patterns',
    variables: [
      {
        name: 'language',
        label: 'Programming Language',
        description: 'The programming language of the code',
        defaultValue: 'typescript',
        required: true,
        type: 'text'
      },
      {
        name: 'code',
        label: 'Code to Review',
        description: 'Paste the code you want reviewed',
        required: true,
        type: 'textarea'
      }
    ],
    metadata: {
      author: 'Content Lab',
      version: '1.0.0',
      usageNotes: 'Great for code reviews, learning, and improving code quality'
    }
  },

  {
    id: 'tech-doc-writer',
    name: 'Technical Documentation Writer',
    description: 'Creates clear, comprehensive technical documentation',
    category: TemplateCategory.RoleBased,
    tags: ['documentation', 'technical', 'writing'],
    systemPrompt: 'You are a technical writer specializing in creating clear, comprehensive documentation for software projects. You excel at explaining complex concepts in simple terms while maintaining technical accuracy.',
    userPrompt: 'Create technical documentation for:\n\n**Project**: {{project_name}}\n**Topic**: {{topic}}\n**Audience**: {{audience}}\n\nInclude:\n- Overview and purpose\n- Key concepts\n- Usage examples\n- Common pitfalls\n- Best practices',
    variables: [
      {
        name: 'project_name',
        label: 'Project Name',
        description: 'Name of the software project',
        required: true,
        type: 'text'
      },
      {
        name: 'topic',
        label: 'Documentation Topic',
        description: 'What aspect to document (API, setup, architecture, etc.)',
        required: true,
        type: 'text'
      },
      {
        name: 'audience',
        label: 'Target Audience',
        description: 'Who will read this (developers, end-users, DevOps, etc.)',
        defaultValue: 'developers',
        type: 'text'
      }
    ]
  },

  {
    id: 'api-design-consultant',
    name: 'API Design Consultant',
    description: 'Expert in RESTful API design and best practices',
    category: TemplateCategory.RoleBased,
    tags: ['api', 'design', 'rest', 'architecture'],
    systemPrompt: 'You are an API design expert with deep knowledge of RESTful principles, OpenAPI specifications, and modern API best practices. You provide actionable recommendations for creating robust, scalable APIs.',
    userPrompt: 'Design a RESTful API for:\n\n**Service**: {{service_name}}\n**Purpose**: {{purpose}}\n**Key Resources**: {{resources}}\n\nProvide:\n- Endpoint structure\n- HTTP methods and status codes\n- Request/response schemas\n- Authentication approach\n- Versioning strategy',
    variables: [
      {
        name: 'service_name',
        label: 'Service Name',
        description: 'Name of the service/microservice',
        required: true,
        type: 'text'
      },
      {
        name: 'purpose',
        label: 'API Purpose',
        description: 'What the API does',
        required: true,
        type: 'textarea'
      },
      {
        name: 'resources',
        label: 'Key Resources',
        description: 'Main resources the API will manage (e.g., users, posts, orders)',
        required: true,
        type: 'text'
      }
    ]
  },

  {
    id: 'data-analyst-expert',
    name: 'Data Analysis Expert',
    description: 'Professional data analyst providing insights and visualizations',
    category: TemplateCategory.RoleBased,
    tags: ['data', 'analysis', 'statistics', 'visualization'],
    systemPrompt: 'You are a data analyst with expertise in statistical analysis, data visualization, and deriving actionable insights from data. You explain findings clearly and recommend appropriate visualization techniques.',
    userPrompt: 'Analyze the following dataset:\n\n**Dataset**: {{dataset_description}}\n**Goal**: {{analysis_goal}}\n**Format**: {{data_format}}\n\nProvide:\n- Key statistics and patterns\n- Data quality assessment\n- Visualization recommendations\n- Actionable insights\n- Next steps for deeper analysis',
    variables: [
      {
        name: 'dataset_description',
        label: 'Dataset Description',
        description: 'Describe the data you have',
        required: true,
        type: 'textarea'
      },
      {
        name: 'analysis_goal',
        label: 'Analysis Goal',
        description: 'What you want to learn from the data',
        required: true,
        type: 'text'
      },
      {
        name: 'data_format',
        label: 'Data Format',
        description: 'Format of your data (CSV, JSON, etc.)',
        defaultValue: 'CSV',
        type: 'text'
      }
    ]
  },

  {
    id: 'creative-writing-coach',
    name: 'Creative Writing Coach',
    description: 'Helps improve creative writing with constructive feedback',
    category: TemplateCategory.RoleBased,
    tags: ['writing', 'creative', 'feedback', 'storytelling'],
    systemPrompt: 'You are a creative writing coach with experience in various genres. You provide encouraging, constructive feedback that helps writers develop their voice while improving technical aspects of their work.',
    userPrompt: 'Review this {{genre}} writing piece:\n\n{{text}}\n\nProvide feedback on:\n- Narrative structure and pacing\n- Character development (if applicable)\n- Voice and style\n- Show vs. tell balance\n- Specific suggestions for improvement',
    variables: [
      {
        name: 'genre',
        label: 'Genre',
        description: 'Type of creative writing',
        defaultValue: 'fiction',
        type: 'select',
        options: ['fiction', 'poetry', 'memoir', 'essay', 'screenplay']
      },
      {
        name: 'text',
        label: 'Writing Sample',
        description: 'Paste your writing here',
        required: true,
        type: 'textarea'
      }
    ]
  },

  // ========================================
  // Task-Specific Prompts (6)
  // ========================================
  {
    id: 'text-summarization',
    name: 'Text Summarization',
    description: 'Summarize long documents into key points',
    category: TemplateCategory.TaskSpecific,
    tags: ['summarization', 'text', 'extraction'],
    userPrompt: 'Summarize the following text in {{length}} style, focusing on {{focus}}:\n\n{{text}}\n\nProvide:\n- Key points ({{num_points}} main takeaways)\n- Brief summary (2-3 sentences)\n- Important details that should not be missed',
    variables: [
      {
        name: 'text',
        label: 'Text to Summarize',
        description: 'Paste the text you want summarized',
        required: true,
        type: 'textarea'
      },
      {
        name: 'length',
        label: 'Summary Length',
        description: 'How detailed should the summary be?',
        defaultValue: 'concise',
        type: 'select',
        options: ['brief', 'concise', 'detailed', 'comprehensive']
      },
      {
        name: 'focus',
        label: 'Focus Area',
        description: 'What to emphasize',
        defaultValue: 'main ideas',
        type: 'text'
      },
      {
        name: 'num_points',
        label: 'Number of Key Points',
        description: 'How many key takeaways?',
        defaultValue: '5',
        type: 'number'
      }
    ]
  },

  {
    id: 'language-translation',
    name: 'Language Translation',
    description: 'Translate text between languages with context awareness',
    category: TemplateCategory.TaskSpecific,
    tags: ['translation', 'language', 'localization'],
    userPrompt: 'Translate the following text from {{source_lang}} to {{target_lang}}:\n\n{{text}}\n\nConsider:\n- Context: {{context}}\n- Tone: {{tone}}\n- Preserve formatting and special terms\n- Provide both literal and natural translations if significantly different',
    variables: [
      {
        name: 'text',
        label: 'Text to Translate',
        description: 'Enter the text to translate',
        required: true,
        type: 'textarea'
      },
      {
        name: 'source_lang',
        label: 'Source Language',
        description: 'Original language',
        required: true,
        type: 'text'
      },
      {
        name: 'target_lang',
        label: 'Target Language',
        description: 'Language to translate to',
        required: true,
        type: 'text'
      },
      {
        name: 'context',
        label: 'Context',
        description: 'Context for the translation (technical, casual, formal, etc.)',
        defaultValue: 'general',
        type: 'text'
      },
      {
        name: 'tone',
        label: 'Desired Tone',
        description: 'Tone to maintain',
        defaultValue: 'neutral',
        type: 'select',
        options: ['formal', 'neutral', 'casual', 'professional']
      }
    ]
  },

  {
    id: 'code-generation',
    name: 'Code Generation',
    description: 'Generate code based on requirements',
    category: TemplateCategory.TaskSpecific,
    tags: ['code', 'generation', 'programming'],
    userPrompt: 'Generate {{language}} code for:\n\n**Requirements**:\n{{requirements}}\n\n**Constraints**:\n- Style: {{style}}\n- Include error handling: {{error_handling}}\n- Add comments: {{comments}}\n\nProvide:\n- Complete, working code\n- Explanation of key decisions\n- Usage example\n- Potential edge cases to consider',
    variables: [
      {
        name: 'language',
        label: 'Programming Language',
        description: 'Target programming language',
        required: true,
        type: 'text'
      },
      {
        name: 'requirements',
        label: 'Requirements',
        description: 'Describe what the code should do',
        required: true,
        type: 'textarea'
      },
      {
        name: 'style',
        label: 'Code Style',
        description: 'Coding style preference',
        defaultValue: 'functional',
        type: 'select',
        options: ['functional', 'object-oriented', 'procedural', 'mixed']
      },
      {
        name: 'error_handling',
        label: 'Error Handling',
        description: 'Include error handling?',
        defaultValue: 'yes',
        type: 'select',
        options: ['yes', 'no', 'basic']
      },
      {
        name: 'comments',
        label: 'Comments Level',
        description: 'How much documentation?',
        defaultValue: 'moderate',
        type: 'select',
        options: ['minimal', 'moderate', 'extensive']
      }
    ]
  },

  {
    id: 'bug-diagnosis',
    name: 'Bug Diagnosis & Fix',
    description: 'Diagnose and fix software bugs',
    category: TemplateCategory.TaskSpecific,
    tags: ['debugging', 'troubleshooting', 'fix'],
    userPrompt: 'Help diagnose and fix this bug:\n\n**Environment**: {{environment}}\n**Expected Behavior**: {{expected}}\n**Actual Behavior**: {{actual}}\n\n**Code**:\n```{{language}}\n{{code}}\n```\n\n**Error Message** (if any):\n{{error_message}}\n\nProvide:\n- Root cause analysis\n- Detailed explanation of the bug\n- Fixed code\n- Prevention strategies',
    variables: [
      {
        name: 'environment',
        label: 'Environment',
        description: 'Where the bug occurs (OS, browser, framework, etc.)',
        type: 'text'
      },
      {
        name: 'language',
        label: 'Programming Language',
        description: 'Language of the buggy code',
        required: true,
        type: 'text'
      },
      {
        name: 'expected',
        label: 'Expected Behavior',
        description: 'What should happen',
        required: true,
        type: 'textarea'
      },
      {
        name: 'actual',
        label: 'Actual Behavior',
        description: 'What actually happens',
        required: true,
        type: 'textarea'
      },
      {
        name: 'code',
        label: 'Buggy Code',
        description: 'Code that contains the bug',
        required: true,
        type: 'textarea'
      },
      {
        name: 'error_message',
        label: 'Error Message',
        description: 'Any error messages or stack traces',
        type: 'textarea'
      }
    ]
  },

  {
    id: 'meeting-notes-formatter',
    name: 'Meeting Notes Formatter',
    description: 'Transform raw meeting notes into structured format',
    category: TemplateCategory.TaskSpecific,
    tags: ['meetings', 'notes', 'organization'],
    userPrompt: 'Format these meeting notes into a structured document:\n\n**Meeting**: {{meeting_title}}\n**Date**: {{date}}\n**Attendees**: {{attendees}}\n\n**Raw Notes**:\n{{notes}}\n\nCreate:\n- Executive summary\n- Key decisions made\n- Action items (with owners and due dates)\n- Open questions\n- Next steps',
    variables: [
      {
        name: 'meeting_title',
        label: 'Meeting Title',
        description: 'Name or topic of the meeting',
        required: true,
        type: 'text'
      },
      {
        name: 'date',
        label: 'Meeting Date',
        description: 'When the meeting occurred',
        type: 'text'
      },
      {
        name: 'attendees',
        label: 'Attendees',
        description: 'Who was in the meeting',
        type: 'text'
      },
      {
        name: 'notes',
        label: 'Raw Notes',
        description: 'Unformatted meeting notes',
        required: true,
        type: 'textarea'
      }
    ]
  },

  {
    id: 'email-response-generator',
    name: 'Email Response Generator',
    description: 'Generate professional email responses',
    category: TemplateCategory.TaskSpecific,
    tags: ['email', 'communication', 'writing'],
    userPrompt: 'Generate a {{tone}} email response to:\n\n**Original Email**:\n{{original_email}}\n\n**Key Points to Address**:\n{{key_points}}\n\n**Tone**: {{tone}}\n**Length**: {{length}}\n\nInclude:\n- Professional greeting and closing\n- Clear addressing of all points\n- Appropriate call-to-action if needed',
    variables: [
      {
        name: 'original_email',
        label: 'Original Email',
        description: 'The email you are responding to',
        required: true,
        type: 'textarea'
      },
      {
        name: 'key_points',
        label: 'Key Points',
        description: 'What to address in your response',
        required: true,
        type: 'textarea'
      },
      {
        name: 'tone',
        label: 'Tone',
        description: 'Desired tone of response',
        defaultValue: 'professional',
        type: 'select',
        options: ['formal', 'professional', 'friendly', 'apologetic', 'assertive']
      },
      {
        name: 'length',
        label: 'Response Length',
        description: 'How long should the response be?',
        defaultValue: 'medium',
        type: 'select',
        options: ['brief', 'medium', 'detailed']
      }
    ]
  },

  // ========================================
  // Few-Shot Examples (4)
  // ========================================
  {
    id: 'sentiment-classifier',
    name: 'Sentiment Classifier',
    description: 'Classify text sentiment with examples',
    category: TemplateCategory.FewShot,
    tags: ['sentiment', 'classification', 'nlp'],
    userPrompt: 'Classify the sentiment of the following text as positive, negative, or neutral.\n\nClassify this text:\n"{{text}}"\n\nProvide:\n- Sentiment (positive/negative/neutral)\n- Confidence level\n- Key phrases that indicate sentiment',
    examples: [
      {
        input: 'I absolutely love this product! It exceeded all my expectations.',
        output: 'Sentiment: Positive\nConfidence: High\nKey phrases: "absolutely love", "exceeded all my expectations"'
      },
      {
        input: 'The service was okay, nothing special but not terrible either.',
        output: 'Sentiment: Neutral\nConfidence: High\nKey phrases: "okay", "nothing special", "not terrible"'
      },
      {
        input: 'Very disappointed with the quality. Would not recommend.',
        output: 'Sentiment: Negative\nConfidence: High\nKey phrases: "very disappointed", "would not recommend"'
      }
    ],
    variables: [
      {
        name: 'text',
        label: 'Text to Classify',
        description: 'Enter the text for sentiment analysis',
        required: true,
        type: 'textarea'
      }
    ]
  },

  {
    id: 'entity-extractor',
    name: 'Entity Extractor',
    description: 'Extract named entities from text',
    category: TemplateCategory.FewShot,
    tags: ['ner', 'extraction', 'entities', 'nlp'],
    userPrompt: 'Extract named entities (people, organizations, locations, dates) from the text.\n\nExtract entities from:\n"{{text}}"\n\nProvide results in this format:\n- People: [list]\n- Organizations: [list]\n- Locations: [list]\n- Dates: [list]\n- Other: [list]',
    examples: [
      {
        input: 'Apple Inc. CEO Tim Cook announced the new iPhone release at the Steve Jobs Theater in Cupertino on September 15th.',
        output: 'People: Tim Cook, Steve Jobs\nOrganizations: Apple Inc.\nLocations: Steve Jobs Theater, Cupertino\nDates: September 15th\nOther: iPhone'
      },
      {
        input: 'The United Nations held a climate summit in Paris last November with leaders from 195 countries.',
        output: 'People: [None explicitly named]\nOrganizations: United Nations\nLocations: Paris\nDates: last November\nOther: climate summit, 195 countries'
      }
    ],
    variables: [
      {
        name: 'text',
        label: 'Text to Analyze',
        description: 'Enter the text for entity extraction',
        required: true,
        type: 'textarea'
      }
    ]
  },

  {
    id: 'intent-classifier',
    name: 'Intent Classifier',
    description: 'Determine user intent from text',
    category: TemplateCategory.FewShot,
    tags: ['intent', 'classification', 'chatbot', 'nlp'],
    userPrompt: 'Classify the user intent from the following text.\n\nClassify intent for:\n"{{text}}"\n\nProvide:\n- Primary intent\n- Confidence level\n- Suggested action',
    examples: [
      {
        input: 'How do I reset my password?',
        output: 'Primary intent: PASSWORD_RESET\nConfidence: High\nSuggested action: Direct to password reset flow'
      },
      {
        input: 'I want to cancel my subscription immediately.',
        output: 'Primary intent: CANCEL_SUBSCRIPTION\nConfidence: High\nSuggested action: Initiate cancellation process with retention offer'
      },
      {
        input: 'What are your business hours?',
        output: 'Primary intent: INFORMATION_REQUEST\nConfidence: High\nSuggested action: Provide business hours information'
      }
    ],
    variables: [
      {
        name: 'text',
        label: 'User Input',
        description: 'Enter the user message to classify',
        required: true,
        type: 'textarea'
      }
    ]
  },

  {
    id: 'category-tagger',
    name: 'Category Tagger',
    description: 'Tag content with relevant categories',
    category: TemplateCategory.FewShot,
    tags: ['categorization', 'tagging', 'classification'],
    userPrompt: 'Tag the following content with relevant categories from: {{categories}}\n\nContent to tag:\n"{{content}}"\n\nProvide:\n- Primary category\n- Secondary categories (if any)\n- Confidence level\n- Keywords that indicate each category',
    examples: [
      {
        input: 'Content: "A new study shows that daily exercise can reduce stress and improve mental health."',
        output: 'Primary category: Health\nSecondary categories: Wellness, Science\nConfidence: High\nKeywords: exercise, mental health, study'
      },
      {
        input: 'Content: "The startup raised $10M in Series A funding to expand its AI-powered platform."',
        output: 'Primary category: Business\nSecondary categories: Technology, Finance\nConfidence: High\nKeywords: startup, funding, AI-powered'
      }
    ],
    variables: [
      {
        name: 'content',
        label: 'Content to Tag',
        description: 'Enter the content for categorization',
        required: true,
        type: 'textarea'
      },
      {
        name: 'categories',
        label: 'Available Categories',
        description: 'List of possible categories (comma-separated)',
        defaultValue: 'Technology, Business, Health, Science, Entertainment, Sports',
        type: 'text'
      }
    ]
  },

  // ========================================
  // Chain-of-Thought Prompts (4)
  // ========================================
  {
    id: 'math-problem-solver',
    name: 'Math Problem Solver',
    description: 'Solve math problems with step-by-step reasoning',
    category: TemplateCategory.ChainOfThought,
    tags: ['math', 'problem-solving', 'reasoning'],
    userPrompt: 'Solve the following math problem step by step:\n\n{{problem}}\n\nShow your work:\n1. First, identify what we know and what we need to find\n2. Choose the appropriate method or formula\n3. Work through the solution step by step\n4. Check your answer\n5. Explain the reasoning at each step',
    variables: [
      {
        name: 'problem',
        label: 'Math Problem',
        description: 'Enter the math problem to solve',
        required: true,
        type: 'textarea'
      }
    ]
  },

  {
    id: 'logical-reasoning',
    name: 'Logical Reasoning',
    description: 'Work through logical problems systematically',
    category: TemplateCategory.ChainOfThought,
    tags: ['logic', 'reasoning', 'problem-solving'],
    userPrompt: 'Analyze this logical problem step by step:\n\n{{problem}}\n\nThink through it:\n1. State what we know (given facts)\n2. Identify any assumptions\n3. List possible approaches\n4. Work through each step logically\n5. Draw conclusions\n6. Verify the logic holds',
    variables: [
      {
        name: 'problem',
        label: 'Logical Problem',
        description: 'Enter the logical problem or puzzle',
        required: true,
        type: 'textarea'
      }
    ]
  },

  {
    id: 'debug-troubleshooter',
    name: 'Debug Troubleshooter',
    description: 'Systematically troubleshoot software issues',
    category: TemplateCategory.ChainOfThought,
    tags: ['debugging', 'troubleshooting', 'systematic'],
    userPrompt: 'Troubleshoot this issue systematically:\n\n**Issue**: {{issue}}\n**Context**: {{context}}\n\nFollow this process:\n1. Understand the problem: What exactly is happening?\n2. Gather information: What data do we have?\n3. Form hypotheses: What could cause this?\n4. Test hypotheses: How can we verify each possibility?\n5. Identify root cause: What is actually wrong?\n6. Propose solution: How do we fix it?\n7. Prevention: How do we avoid this in the future?',
    variables: [
      {
        name: 'issue',
        label: 'Issue Description',
        description: 'Describe the problem',
        required: true,
        type: 'textarea'
      },
      {
        name: 'context',
        label: 'Context',
        description: 'Environment, stack traces, recent changes, etc.',
        required: true,
        type: 'textarea'
      }
    ]
  },

  {
    id: 'requirements-analyzer',
    name: 'Requirements Analyzer',
    description: 'Analyze project requirements systematically',
    category: TemplateCategory.ChainOfThought,
    tags: ['requirements', 'analysis', 'planning'],
    userPrompt: 'Analyze these project requirements:\n\n{{requirements}}\n\nAnalyze step by step:\n1. Identify stakeholders and their needs\n2. Break down into functional requirements\n3. Identify non-functional requirements\n4. Spot ambiguities or conflicts\n5. Assess feasibility\n6. Suggest priorities\n7. Identify risks and dependencies',
    variables: [
      {
        name: 'requirements',
        label: 'Requirements',
        description: 'Enter the project requirements',
        required: true,
        type: 'textarea'
      }
    ]
  },

  // ========================================
  // Structured Output Prompts (4)
  // ========================================
  {
    id: 'json-extractor',
    name: 'JSON Data Extractor',
    description: 'Extract structured data as JSON',
    category: TemplateCategory.StructuredOutput,
    tags: ['json', 'extraction', 'structured-data'],
    userPrompt: 'Extract structured data from the following text and format as JSON:\n\n{{text}}\n\nExtract these fields:\n{{fields}}\n\nProvide:\n- Valid JSON output\n- Include all specified fields\n- Use null for missing data\n- Follow JSON best practices for naming',
    variables: [
      {
        name: 'text',
        label: 'Text Source',
        description: 'Text containing data to extract',
        required: true,
        type: 'textarea'
      },
      {
        name: 'fields',
        label: 'Fields to Extract',
        description: 'List the fields you want (comma-separated)',
        required: true,
        type: 'text'
      }
    ]
  },

  {
    id: 'csv-generator',
    name: 'CSV Data Generator',
    description: 'Generate CSV formatted data',
    category: TemplateCategory.StructuredOutput,
    tags: ['csv', 'data', 'structured-output'],
    userPrompt: 'Convert this data into CSV format:\n\n{{data}}\n\nRequirements:\n- Columns: {{columns}}\n- Include header row: {{include_header}}\n- Delimiter: {{delimiter}}\n\nEnsure:\n- Proper escaping of special characters\n- Consistent formatting\n- Valid CSV structure',
    variables: [
      {
        name: 'data',
        label: 'Data to Convert',
        description: 'Data in any format',
        required: true,
        type: 'textarea'
      },
      {
        name: 'columns',
        label: 'Column Names',
        description: 'Comma-separated list of columns',
        required: true,
        type: 'text'
      },
      {
        name: 'include_header',
        label: 'Include Header',
        description: 'Include header row?',
        defaultValue: 'yes',
        type: 'select',
        options: ['yes', 'no']
      },
      {
        name: 'delimiter',
        label: 'Delimiter',
        description: 'Field delimiter',
        defaultValue: ',',
        type: 'select',
        options: [',', ';', '|', 'tab']
      }
    ]
  },

  {
    id: 'markdown-report',
    name: 'Markdown Report Generator',
    description: 'Generate well-formatted markdown reports',
    category: TemplateCategory.StructuredOutput,
    tags: ['markdown', 'report', 'documentation'],
    userPrompt: 'Create a markdown report:\n\n**Title**: {{title}}\n**Type**: {{report_type}}\n**Content**: {{content}}\n\nInclude:\n- Proper heading hierarchy\n- Tables if appropriate\n- Code blocks for technical content\n- Lists for structured information\n- Links and references\n- Summary section',
    variables: [
      {
        name: 'title',
        label: 'Report Title',
        description: 'Title of the report',
        required: true,
        type: 'text'
      },
      {
        name: 'report_type',
        label: 'Report Type',
        description: 'Type of report',
        defaultValue: 'Analysis',
        type: 'select',
        options: ['Analysis', 'Summary', 'Technical', 'Status', 'Incident']
      },
      {
        name: 'content',
        label: 'Report Content',
        description: 'Raw content for the report',
        required: true,
        type: 'textarea'
      }
    ]
  },

  {
    id: 'api-response-formatter',
    name: 'API Response Formatter',
    description: 'Format API responses with proper structure',
    category: TemplateCategory.StructuredOutput,
    tags: ['api', 'json', 'response', 'format'],
    userPrompt: 'Format this as a {{api_type}} API response:\n\n**Data**: {{data}}\n**Status**: {{status}}\n**Include Metadata**: {{include_metadata}}\n\nProvide:\n- Properly structured JSON\n- Standard fields (status, data, message, etc.)\n- Error handling structure if applicable\n- Pagination info if relevant\n- Follow REST/{{api_type}} conventions',
    variables: [
      {
        name: 'data',
        label: 'Response Data',
        description: 'The data to include in the response',
        required: true,
        type: 'textarea'
      },
      {
        name: 'api_type',
        label: 'API Type',
        description: 'Type of API',
        defaultValue: 'REST',
        type: 'select',
        options: ['REST', 'GraphQL', 'JSON-RPC']
      },
      {
        name: 'status',
        label: 'Response Status',
        description: 'Success or error status',
        defaultValue: 'success',
        type: 'select',
        options: ['success', 'error', 'partial']
      },
      {
        name: 'include_metadata',
        label: 'Include Metadata',
        description: 'Include timestamp, version, etc.?',
        defaultValue: 'yes',
        type: 'select',
        options: ['yes', 'no']
      }
    ]
  },

  // ========================================
  // Constitutional AI Prompts (2)
  // ========================================
  {
    id: 'safe-content-assistant',
    name: 'Safe Content Assistant',
    description: 'Generate helpful content with safety guidelines',
    category: TemplateCategory.ConstitutionalAI,
    tags: ['safety', 'helpful', 'harmless'],
    systemPrompt: 'You are a helpful assistant that prioritizes being helpful, harmless, and honest. You refuse requests that could cause harm, respect privacy, avoid bias, and acknowledge uncertainty when appropriate. You aim to be maximally helpful within ethical boundaries.',
    userPrompt: 'Please help with:\n\n{{request}}\n\nGuidelines:\n- Be maximally helpful\n- Avoid potential harms\n- Respect privacy and consent\n- Acknowledge limitations\n- Suggest alternatives if request is problematic',
    variables: [
      {
        name: 'request',
        label: 'User Request',
        description: 'What you need help with',
        required: true,
        type: 'textarea'
      }
    ],
    metadata: {
      usageNotes: 'Designed to balance helpfulness with safety considerations'
    }
  },

  {
    id: 'ethical-decision-helper',
    name: 'Ethical Decision Helper',
    description: 'Analyze decisions from multiple ethical perspectives',
    category: TemplateCategory.ConstitutionalAI,
    tags: ['ethics', 'decision-making', 'analysis'],
    systemPrompt: 'You help people think through ethical dimensions of decisions by presenting multiple perspectives without imposing a single view. You consider stakeholder impacts, long-term consequences, and various ethical frameworks.',
    userPrompt: 'Help analyze this decision from ethical perspectives:\n\n**Decision**: {{decision}}\n**Context**: {{context}}\n**Stakeholders**: {{stakeholders}}\n\nConsider:\n1. Immediate and long-term consequences\n2. Who is affected and how\n3. Different ethical frameworks (utilitarian, deontological, virtue ethics)\n4. Potential unintended consequences\n5. Alternative approaches\n6. Questions to consider further',
    variables: [
      {
        name: 'decision',
        label: 'Decision to Analyze',
        description: 'What decision are you considering?',
        required: true,
        type: 'textarea'
      },
      {
        name: 'context',
        label: 'Context',
        description: 'Relevant background and constraints',
        required: true,
        type: 'textarea'
      },
      {
        name: 'stakeholders',
        label: 'Stakeholders',
        description: 'Who will be affected?',
        type: 'text'
      }
    ],
    metadata: {
      usageNotes: 'Helps consider multiple perspectives without prescribing answers'
    }
  }
];
