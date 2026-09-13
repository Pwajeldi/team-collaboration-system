import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// Extend axios's config type so TypeScript knows about our custom `_retry` flag.
// Axios doesn't ship this property — we're using it ourselves to mark
// "this request has already attempted one refresh-and-retry cycle",
// so we need TS to accept it without complaining.
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// Main API instance — used for all normal app requests.
// This is the one with the 401-handling interceptor attached.
export const API_URL:string = import.meta.env.VITE_API_URL;
export const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true, // sends the httpOnly refreshToken cookie automatically on every request
});

// Separate, interceptor-free instance used ONLY for the refresh call itself.
// Why a second instance: if `api` had this same interceptor attached,
// and the refresh call ever came back 401 (refresh token itself expired/invalid),
// the interceptor would try to intercept its OWN failed refresh call and
// attempt to refresh again — recursively. A bare instance sidesteps that
// entirely: a 401 from this instance just fails normally, no retry logic attached.
const refreshApi = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true, // still needs to send the refreshToken cookie
});

// Attach the current access token to every outgoing request on the main instance.
api.interceptors.request.use((config) => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// ---- Refresh-queueing state ----
// These live at module scope (not inside a component or function) because
// axios interceptors run outside React entirely, and we need this state to
// persist across every request the whole app makes, not reset per-render.

// True while a refresh call is currently in flight.
// Prevents multiple simultaneous requests from each independently triggering
// their own /auth/refresh call — only the first 401 starts a refresh;
// everyone else waits on it.
let isRefreshing = false;

// Holds "resolve" callbacks for requests that arrived while a refresh was
// already in progress. Once the in-flight refresh finishes, we call every
// callback in this list with the new token, letting all the queued requests
// retry themselves with it.
let refreshSubscribers: ((newAccessToken: string) => void)[] = [];

// Registers a callback to run once the current in-flight refresh resolves.
const subscribeTokenRefresh = (callback: (newAccessToken: string) => void) => {
    refreshSubscribers.push(callback);
};

// Runs every queued callback with the freshly obtained token, then clears the queue.
const onRefreshed = (newAccessToken: string) => {
    refreshSubscribers.forEach((callback) => callback(newAccessToken));
    refreshSubscribers = [];
};

// Response interceptor: runs on every response the main `api` instance receives.
api.interceptors.response.use(
    // Any successful (non-error) response passes through untouched.
    (response) => response,

    // Runs whenever a response comes back with an error status.
    async (error: AxiosError) => {
        // Cast so TypeScript recognizes our custom `_retry` field on the config.
        const originalRequest = error.config as RetryableRequestConfig;

        // Only handle 401s, and only if this specific request hasn't already
        // been retried once. Without the `_retry` check, a request that fails
        // even AFTER a successful refresh (e.g. genuinely bad credentials)
        // would loop forever, re-triggering refresh attempts indefinitely.
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Case 1: a refresh is already in progress (triggered by some
            // other request that also hit a 401 first). Instead of firing a
            // second /auth/refresh call, queue this request and wait for the
            // in-flight one to finish.
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((newAccessToken: string) => {
                        // Attach the new token and replay the original request.
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            // Case 2: this is the first request to hit a 401 — take
            // responsibility for performing the refresh.
            isRefreshing = true;

            try {
                // Call the refresh endpoint on the SEPARATE instance (no
                // interceptor attached), so a failure here doesn't recurse.
                // The refreshToken cookie is sent automatically by the browser
                // via withCredentials — nothing to attach manually.
                // Response body is a bare string (the new access token),
                // per Ok(newTokens.AccessToken) on the backend.
                const { data: newAccessToken } = await refreshApi.post<string>("/auth/refresh");

                // Persist the new access token for future requests.
                sessionStorage.setItem("accessToken", newAccessToken);

                // Update the default header so any request made after this
                // point (without going through the request interceptor again
                // mid-flight) still picks up the new token.
                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

                // Attach the new token to the request that originally failed.
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Release every request that was queued while this refresh
                // was in flight, passing them the new token.
                onRefreshed(newAccessToken);

                // Reset the flag now that refreshing is complete.
                isRefreshing = false;

                // Retry the original request with the new token attached.
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh itself failed — the refresh token is invalid/expired.
                // There's no recovering from this client-side; the user needs
                // to log in again.
                isRefreshing = false;
                refreshSubscribers = []; // clear any requests still waiting — they'll fail too

                sessionStorage.clear();
                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        // Any error that isn't a 401 (or is a 401 on an already-retried
        // request) passes through as a normal rejected promise.
        return Promise.reject(error);
    }
);

export default api;