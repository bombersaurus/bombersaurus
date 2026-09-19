
window.RWH_DATA = {
  version: "2.1.0",
  courses: {
    digitalSkills: {
      id: "digitalSkills",
      name: "Digital Skills for Work Level 3",
      sourceName: "Gateway Qualifications Level 3 Certificate and Diploma in Software Development — uploaded extract",
      deliveryName: "Oldham College Scheme of Learning 2026/27",
      intent: "Develop technical, practical and professional digital skills for progression into employment, apprenticeships, T Level Digital, higher education or other digital pathways.",
      deliverySequence: "Core programming, networking and cyber security first; then testing, robotics, communication systems and access control; project units later so learners can apply earlier knowledge.",
      elevateSkills: [
        "Technical Digital Skills",
        "Improving Your Performance",
        "Project Management",
        "Problem Solving",
        "Professional Practice and Communication"
      ],
      deliveryAreas: [
        {
          id:"ethical-hacking", title:"Ethical Hacking", source:"Scheme of Learning",
          note:"Delivery area in the Oldham College Scheme of Learning. Do not treat it as a criterion from the uploaded Gateway extract.",
          topics:["Role and purpose of ethical hacking","Authorisation and scope","Identification of vulnerabilities","Penetration testing","Physical, logical and social engineering techniques","IDS, IPS and honeypots","Encryption and security testing","Reporting, vetting and professional conduct"]
        },
        {
          id:"networking", title:"Networking", source:"Scheme of Learning",
          note:"Delivery area in the Oldham College Scheme of Learning. Do not treat it as a criterion from the uploaded Gateway extract.",
          topics:["LAN, WAN, PAN and internet networks","Servers, switches and routers","Network topologies","Protocols and services","IP addressing","Wireless standards and security","Network troubleshooting"]
        },
        {
          id:"data-communication", title:"Data Communication", source:"Scheme of Learning",
          note:"Delivery area in the Oldham College Scheme of Learning. Do not treat it as a criterion from the uploaded Gateway extract.",
          topics:["Communication devices","Transmission media","Data transmission","Protocols","Wired and wireless communication","Performance, reliability and security"]
        },
        {
          id:"access-control", title:"Access Control", source:"Scheme of Learning",
          note:"Delivery area in the Oldham College Scheme of Learning. Do not treat it as a criterion from the uploaded Gateway extract.",
          topics:["Confidentiality, integrity and availability","Authentication and authorisation","Role-based access control","Multi-factor authentication","Passwordless authentication","Physical access controls","Cloud identity and access"]
        },
        {
          id:"network-project", title:"Network Project", source:"Scheme of Learning",
          note:"Applied project delivery area in the Scheme of Learning.",
          topics:["Business case","Stakeholders","Objectives","Scope and constraints","Risks","Resources and deliverables","Monitoring and progress tracking","Post-project review"]
        },
        {
          id:"software-project-management", title:"Software Project Management", source:"Scheme of Learning",
          note:"Applied software project delivery area in the Scheme of Learning.",
          topics:["Waterfall","Agile","Rapid Application Development","PRINCE2","Gantt planning","Monitoring and variance","Stakeholder feedback","Project evaluation"]
        }
      ],
      units: [
        {
          id:"project-management", title:"Project Management", code:"F/618/5180", glh:42, credits:6,
          aim:"Understand project management concepts, methodologies, tools and the processes used to plan, monitor and review IT projects.",
          criteria:[
            {code:"1.1",text:"Explain the stages of the project lifecycle as they apply to a given IT project."},
            {code:"1.2",text:"Describe key concepts, issues and risks when managing IT projects."},
            {code:"1.3",text:"Compare the characteristics of different project management methodologies used by organisations."},
            {code:"2.1",text:"Produce a project specification for an IT project in line with requirements."},
            {code:"2.2",text:"Use project management software to plan an IT project."},
            {code:"3.1",text:"Use project management software to monitor a project plan and track progress against the plan."},
            {code:"3.2",text:"Carry out a post-project review to determine project outcomes."}
          ],
          topics:["Project lifecycle","Business case","Project specification","Scope and constraints","Gantt charts","PERT and critical path","Risk management","Milestones and baselines","Stakeholder communication","Post-project review"]
        },
        {
          id:"javascript", title:"JavaScript", code:"K/618/5237", glh:42, credits:6,
          aim:"Understand JavaScript as a web programming language and use it to create interactive web page behaviour.",
          criteria:[
            {code:"1.1",text:"Explain how JavaScript is used as a web programming language."},
            {code:"2.1",text:"Use JavaScript to prompt and validate inputs in web pages."},
            {code:"2.2",text:"Use document.write to display messages in web pages."},
            {code:"2.3",text:"Alter, show, hide and move objects in web pages."},
            {code:"2.4",text:"Use JavaScript to include special effects in web pages."},
            {code:"2.5",text:"Use functions and variables to customise web pages."},
            {code:"2.6",text:"Use functions and variables for functional web pages."},
            {code:"2.7",text:"Use event handlers to trigger JavaScript code."}
          ],
          topics:["JavaScript purpose","Client-side interaction","Validation","Variables","Functions","DOM interaction","Event handlers"]
        },
        {
          id:"maths-computing", title:"Maths for Computing", code:"M/618/5238", glh:42, credits:6,
          aim:"Apply mathematical techniques relevant to computing, including matrices, sequences, probability, number systems and data interpretation.",
          criteria:[
            {code:"1.1",text:"Show how matrices can be used to represent ordered data."},
            {code:"1.2",text:"Perform add, subtract and scalar multiplication operations on a matrix."},
            {code:"1.3",text:"Multiply two matrices."},
            {code:"1.4",text:"Find the inverse and transpose of a matrix."},
            {code:"1.5",text:"Apply matrix techniques to solve simultaneous linear equations."},
            {code:"2.1",text:"Apply sequence and series techniques to solve problems."},
            {code:"2.2",text:"Apply probability and recursion techniques to solve problems."},
            {code:"3.1",text:"Explain how number systems are used in computing."},
            {code:"3.2",text:"Perform basic operations on number systems."},
            {code:"3.3",text:"Perform conversion operations between number systems."},
            {code:"4.1",text:"Gather data for a defined purpose."},
            {code:"4.2",text:"Interpret trends and patterns in data."}
          ],
          topics:["Matrices","Sequences and series","Probability","Recursion","Binary","Hexadecimal","Number conversion","Data collection","Trend interpretation"]
        },
        {
          id:"oop", title:"Object Oriented Programming", code:"T/618/5239", glh:42, credits:6,
          aim:"Understand core object-oriented concepts and design, develop, test and document an object-oriented program.",
          criteria:[
            {code:"1.1",text:"Explain the key features of object oriented programming."},
            {code:"1.2",text:"Explain the importance of encapsulation, inheritance and polymorphism in object oriented programming."},
            {code:"2.1",text:"Demonstrate use of object oriented tools and techniques."},
            {code:"3.1",text:"Design an object oriented program."},
            {code:"3.2",text:"Develop an object oriented program."},
            {code:"4.1",text:"Test an object oriented program."},
            {code:"4.2",text:"Document appropriate action to correct errors."},
            {code:"4.3",text:"Create technical documentation for the support and maintenance of the program."}
          ],
          topics:["Classes and objects","Attributes and methods","Encapsulation","Inheritance","Polymorphism","Abstraction","Constructors","Object relationships","UML","Testing and documentation"]
        },
        {
          id:"programming-implementation", title:"Programming Implementation", code:"K/618/5240", glh:42, credits:6,
          aim:"Understand programming principles, variables, control and data structures, algorithms, testing, coding standards and requirements.",
          criteria:[
            {code:"1.1",text:"Explain the principles and concepts of programming languages."},
            {code:"2.1",text:"Interpret variables within programming languages."},
            {code:"2.2",text:"Interpret common programming control structures that are used when developing code."},
            {code:"2.3",text:"Describe the use of common data structures."},
            {code:"2.4",text:"Describe how algorithms are used in programming."},
            {code:"2.5",text:"Describe how to test and debug programs."},
            {code:"3.1",text:"Identify the elements of common coding standards."},
            {code:"3.2",text:"Explain the role and importance of good coding practices."},
            {code:"4.1",text:"Identify the types of functional and non-functional requirements."},
            {code:"4.2",text:"Describe the tests used for functional and non-functional requirements."}
          ],
          topics:["Programming paradigms","Variables and data types","Sequence","Selection","Iteration","Data structures","Algorithms","Syntax and logic errors","Debugging","Coding standards","Functional requirements","Non-functional requirements"]
        },
        {
          id:"robot-technology", title:"Robot Technology", code:"K/618/5190", glh:42, credits:6,
          aim:"Understand robot operation, components, ethics, legislation, programming and safe operation.",
          criteria:[
            {code:"1.1",text:"Explain the operating, design and control principles of different types of robots."},
            {code:"1.2",text:"Explain how different sensors and end effectors are used in robots."},
            {code:"1.3",text:"Analyse the benefits and limitations of using robots for routine tasks."},
            {code:"2.1",text:"Explain how legislation and roboethics influence the development and use of robots."},
            {code:"3.1",text:"Design an operating program for a robot to enable it to carry out a specific function."},
            {code:"3.2",text:"Develop an operating program for a robot to enable it to carry out a specific function."},
            {code:"4.1",text:"Explain the health and safety requirements, and maintenance procedures for the safe operation of robots."}
          ],
          topics:["Robot types","Control principles","Sensors","End effectors","Benefits and limitations","Roboethics","Robot programming","Health and safety","Maintenance"]
        },
        {
          id:"software-testing", title:"Software Testing", code:"M/618/5241", glh:42, credits:6,
          aim:"Understand testing strategies, techniques and stages; plan and implement tests; identify test data; record and report results.",
          criteria:[
            {code:"1.1",text:"Explain the purpose and methods of software testing."},
            {code:"1.2",text:"Describe the different stages and types of software testing."},
            {code:"1.3",text:"Explain how automation is used in software testing."},
            {code:"1.4",text:"Describe functional and structural testing."},
            {code:"2.1",text:"Design appropriate test data."},
            {code:"2.2",text:"Develop a test plan in line with requirements."},
            {code:"2.3",text:"Implement a test plan and record results."},
            {code:"2.4",text:"Produce a test report."}
          ],
          topics:["Testing purpose","Testing stages","Black-box and white-box","Functional and structural testing","Automation","Test cases","Normal boundary and invalid data","Expected vs actual","Test logs","Test reports"]
        }
      ],
      deliveryWeeks: [
        {
          week:1,
          title:"Induction and core foundations",
          learning:[
            "Programming Implementation: programming paradigms and where they are used.",
            "OOP: class, object, attribute and method using real-world examples.",
            "Networking: LAN, WAN, PAN and internet networks.",
            "Ethical Hacking: purpose of ethical hacking and why authorisation is essential.",
            "Elevate/Portfolio: folder structure, baseline skills review and evidence expectations."
          ],
          assessment:"Baseline quiz, portfolio check, short definitions and exit ticket."
        },
        {
          week:2,
          title:"Variables, OOP concepts, networking components and authorised testing",
          learning:[
            "Programming Implementation: variables and data types.",
            "OOP: encapsulation, inheritance, polymorphism and abstraction.",
            "Networking: key components including servers, switches and routers.",
            "Ethical Hacking: authorised testing and professional responsibilities."
          ],
          assessment:"Variables worksheet, OOP mini-whiteboard checks, networking quiz and short ethical-hacking response."
        },
        {
          week:8,
          title:"Consolidation and assessment preparation",
          learning:[
            "Programming Implementation: paradigms, variables, control structures, data structures and debugging.",
            "OOP: object relationships, constructors and interaction between objects.",
            "Networking: wireless standards, antennas, MIMO, speed, security and coverage.",
            "Ethical Hacking: compare physical, logical and social techniques.",
            "Elevate: build a digital-sector CV using technical and transferable skills."
          ],
          assessment:"Consolidation quiz, OOP relationship diagram, wireless scenario, ethical-hacking comparison draft and CV skills section."
        }
      ]
    },
    tlevel: {
      id:"tlevel",
      name:"T Level Digital Software Development Year 1",
      sourceName:"T Level Technical Qualification in Digital Software Development (Level 3), Version 1.0 May 2025",
      firstTeaching:"September 2025",
      assessment:[
        {name:"Core Paper 1",duration:"2h 15m",marks:90,weight:"30%"},
        {name:"Core Paper 2",duration:"2h 15m",marks:90,weight:"30%"},
        {name:"Employer Set Project",duration:"14h 30m",marks:100,weight:"40%"},
        {name:"Occupational Specialism project",duration:"50h 30m",marks:144,weight:"OS component"}
      ],
      core:[
        {id:"core-1",title:"Content Area 1: Problem solving",paper:1,count:38,topics:["Problem decomposition","Logical thinking","Algorithms","Problem-solving approaches"]},
        {id:"core-2",title:"Content Area 2: Introduction to programming",paper:1,count:87,topics:["Programming concepts","Data types","Control flow","Algorithms","Software development"]},
        {id:"core-3",title:"Content Area 3: Emerging issues",paper:1,count:8,topics:["Emerging technology","Social impact","Ethical considerations"]},
        {id:"core-4",title:"Content Area 4: Legislation and regulatory requirements",paper:1,count:16,topics:["Health and safety","Data Protection Act and GDPR","Computer Misuse Act","Equality legislation","Intellectual property","International law in cyberspace"]},
        {id:"core-5",title:"Content Area 5: Business context",paper:2,count:16,topics:["User needs","Product and service quality","Accessibility","Compatibility","Availability","End-user support","Organisational risk"]},
        {id:"core-6",title:"Content Area 6: Data",paper:2,count:59,topics:["Data concepts","Data structures","Data quality","Databases","Analysis"]},
        {id:"core-7",title:"Content Area 7: Digital environments",paper:2,count:32,topics:["Digital systems","Infrastructure","Platforms","Networks and environments"]},
        {id:"core-8",title:"Content Area 8: Security",paper:2,count:16,topics:["Security concepts","Threats","Controls","Risk and response"]}
      ],
      os:[
        {id:"os-1",title:"Analyse a problem to define requirements and acceptance criteria aligned to user needs"},
        {id:"os-2",title:"Apply ethical principles and manage risks in line with legal and regulatory requirements when developing software"},
        {id:"os-3",title:"Discover, evaluate and apply reliable sources of knowledge"},
        {id:"os-4",title:"Design"},
        {id:"os-5",title:"Create solutions in a social and collaborative environment"},
        {id:"os-6",title:"Implement a solution using at least two appropriate languages"},
        {id:"os-7",title:"Testing a software solution"},
        {id:"os-8",title:"Change, maintain and support software"}
      ]
    }
  },
  defaultTeachingStyle: [
    "Use the Oldham College lesson-template feel: cream/white slide canvas, orange accent, Calibri/Arial, restrained professional layout.",
    "Use concise, natural, professional wording. Avoid obvious AI phrasing and walls of text.",
    "Keep one clear concept per slide wherever practical.",
    "Start with classroom expectations, a Do Now/retrieval activity and clear learning objectives.",
    "Link new learning and tasks to specification / assessment criteria where available.",
    "Normally use two teaching slides followed by an active task.",
    "Use realistic college, workplace, app, business and digital-industry scenarios.",
    "Use paired work, individual tasks and groups of 3 where useful; tasks must have a clear expected output.",
    "Scaffold weaker or newer learners and include genuine stretch for stronger learners.",
    "Theory-only means no practical work or code unless explicitly requested.",
    "For programming, use code only when it adds value and supports the specification.",
    "Use worked/model answers before independent assessment where helpful.",
    "Tasks should demand full sentences, justification, comparison or evidence rather than vague discussion.",
    "Finish with five recap questions plus an extension or exit ticket.",
    "Never use real learner names in generated examples.",
    "Default lesson duration is around 3 to 3.5 hours and around 20 slides.",
    "Marking format: WWW / EBI / Overall / Indicative Grade, with precise missing evidence."
  ],
  classroomExpectations:[
    "Coats, jackets, hats and outdoor gear off",
    "I.D. cards visible",
    "Phones away",
    "Log in, turn off the monitor and face the front"
  ]
};
