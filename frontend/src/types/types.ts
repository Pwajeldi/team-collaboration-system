export interface JwtPayload{
    sub: string,
    email: string
}

export interface loginPayload{
    email: string
    password: string
}

export interface AuthContextType{
    userId: string | null;
    email: string | null;
    setUserFromToken: (token: string) => void;
}

export interface CreateMemberDto{
    firstName: string,
    lastName: string,
    email: string,
    jobTitle: string,
    department: number,
    role: string,
    password: string,
    confirmPassword: string,
    profilePicture?: File,
}

export interface PagedMembersResponse{
    page: number,
    pageSize: number,
    total: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    nextPage: number | null,
    previousPage: number | null,
    items: getMemberResponse[],
}

export interface LoginResponse{
    token: string,
    role: string,
    email: string,
    fullName: string,
    department: string,
}

export interface Attachments{
    id: number,
    blobName: string,
    fileName: string,
    contentType: string,
    fileSizeBytes: number
}

export interface UploadAttachmentResponse{
    id: number;
    blobName: string,
    fileName: string,
    contentType: string,
    fileSizeBytes: number,
}

export interface MessageResponse{
    messageId: number,
    senderId: string,
    senderName: string,
    recipientId: string,
    content: string,
    sentDate: string,
    isRead: boolean,
    isDelivered: boolean,
    attachments: Attachments[]
}

export interface PaginatedMessageResponse{
    messages: MessageResponse[],
    nextCursor: string;
}

export interface GetMessageDto{
    otherUserId: string,
    encodedCursor: string | undefined
}

export interface UserList{
    fullName: string,
    userId: string,
    email: string,
    unreadMessages: number,
}

export interface UpdateTaskDto {
    title: string | undefined;
    description?: string | undefined;
    priority: TaskPriorityType;
    dueDate?: string | undefined;
    assigneeId: string;
    progress?: number;
}

// types/types.ts (add alongside your existing DTOs)

export const TaskStatus = {
    NotStarted: "NotStarted",
    InProgress: "InProgress",
    InReview: "InReview",
    Completed: "Completed",
    Blocked: "Blocked",
    Cancelled: "Cancelled",
} as const;
export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
    Low: "Low",
    Medium: "Medium",
    High: "High",
} as const;
export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];

export interface TaskResponse {
    id: string;
    title: string;
    description?: string;
    status: TaskStatusType;
    priority: TaskPriorityType;
    progress: number;
    dueDate?: string;
    createdAt: string;
    completedAt?: string;
    assignedById: string;
    assignedByName: string;
    assignedToId: string;
    assignedToName: string;
}

export interface CreateTaskDto {
    title: string;
    description?: string;
    assigneeId: string;
    priority: TaskPriorityType;
    dueDate?: string;
}

export interface TaskQueryParams {
    status?: TaskStatusType;
    priority?: TaskPriorityType;
    assigneeId?: string;
    search?: string;
}

export interface DepartmentMessageResponse {
    messageId: number;
    senderId: string;
    senderName: string;
    content: string;
    sentDate: string
}

export interface createDepartmentDto {
    departmentName: string
}

export interface AssignableMembers {
    userId: string;
    fullName: string;
}

export interface CreateEventDto {
    title: string;
    description?: string;
    location?: string;
    start: string; // ISO
    end: string;   // ISO
    attendeeIds: string[];
    isMeeting: boolean;
}

export interface AttendeeResponse {
    userId: string;
    fullName: string;
    hadOverlapAtCreation: boolean;
    status: string;
}

export interface EventResponse {
    id: string;
    title: string;
    description?: string;
    location?: string;
    start: string;
    end: string;
    organizerName: string;
    organizerId: string;
    attendees: AttendeeResponse[];
    isMeeting: boolean;
    meetingId?: string;
    meetingStatus?: "Scheduled" | "Live" | "Ended";
}

export interface UpdateEventDto{
    eventId: string;
    eventDescription?: string;
    userIds?: string[];
    start?: string;
    end?: string;
    location?: string;
    title?: string;
    isMeeting: boolean;
}

export interface UpdateEventTimeDto{
    eventId: string,
    newStartTime: string,
    newEndTime: string,
}

export interface DepartmentMessageResponse {
    messageId: number;
    content: string;
    sentDate: string;
    senderId: string;
    senderName: string;
}

export interface PaginatedDepartmentMessageResponse {
    messages: DepartmentMessageResponse[];
    NextCursor: string | null;
}

export interface DepartmentResponse {
    departmentId: number;
    departmentName: string;
}

export interface getMemberResponse {
    memberId: string;
    firstName: string;
    lastName: string;
    email: string;
    dateJoined: string;
    jobTitle?: string;
    department: string;
    departmentId: number; // NEW — confirm backend's GetMembers query selects this
    role: string;         // NEW — confirm backend's GetMembers query selects this
}

export interface UpdateMemberDto {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    role?: string;
    departmentId?: number;
}

export interface MemberQueryParams {
    search?: string;
    departmentId?: number;
    jobTitle?: string;
    isActive?: boolean;
}

export interface TaskSummaryResponse{
    totalTasks: number;
    inProgressTasks: number;
    inReviewTasks: number;
    completedTasks: number;
    overdueTasks: number;
}

export interface ManagerDashboardResponse{
    firstName?: string;
    departmentName?: string;
    teamMemberCount?: number;
    teamTaskSummary?: TaskSummaryResponse;
    eventsTodayCount?: number;
    todayEvents?: DashboardEventResponse[];
    recentMessages: RecentMessageDto[];
    recentTasks: RecentTasksDto[];
    unreadMessageCount: number
}

export interface AdminDashboardResponse{
    responseAsManager: ManagerDashboardResponse;
    taskActivity: TaskActivityDto[];
    departmentCount: number;
    allMembersCount: number;
    unreadMessageCount: number;
}

export interface RegularDashboardResponse{
    firstName?: string;
    departmentName?: string;
    taskSummary?: TaskSummaryResponse;
    eventsTodayCount?: number;
    todayEvents?: DashboardEventResponse[];
    recentMessages: RecentMessageDto[];
    recentTasks: RecentTasksDto[];
    unreadMessageCount: number;
}

export interface FetchDashboardResponse{
    managerDashboardResponse?: ManagerDashboardResponse;
    adminDashboardResponse?: AdminDashboardResponse;
    regularDashboardResponse?: RegularDashboardResponse;
}

export interface TaskActivityDto {
    date: string;
    created: number;
    due: number;
    completed: number;
}

export interface DashboardEventResponse{
    title: string;
    start: string;
    end: string;
    location: string;
}

export interface RecentMessageDto{
    message: string;
    senderName: string;
    sentAt: string;
}

export interface RecentTasksDto{
    title: string;
    status: string;
    priority: string;
    dueDate: string;
    assignedToName: string;
}

export interface UserProfileResponse{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    role: string;
    jobTitle: string;
    departmentId: number;
    dateJoined: string;
    bio: string;
    linkedInUrl: string;
    githubUrl: string;
    xurl: string;
    facebookUrl: string;
    profilePictureUrl: string;
}

export interface UpdateProfileDto{
    phoneNumber?: string;
    dateOfBirth?: string;
    bio?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    xurl?: string
    facebookUrl?: string;
    profilePictureUrl?: string;
}

export interface PasswordResetDto{
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface ChangePasswordDto{
    email: string;
    resetToken: string;
    newPassword: string;
    confirmNewPassword: string;
}