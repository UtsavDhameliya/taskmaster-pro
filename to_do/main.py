import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import src.models  # Ensure models are mapped
from src.routes.user_routes import user_routers
from src.routes.todo_routes import todo_router
from src.routes.admin_routes import admin

app = FastAPI(
    title="TaskMaster Pro API",
    description="Full-featured Todo List backend with authentication, admin controls, and task management",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routers, prefix="/v1/user", tags=["user"])
app.include_router(todo_router, prefix="/v1/Todo", tags=["Todo"])
app.include_router(admin, prefix="/v1/admin", tags=["admin"])


@app.get("/api/health")
def health():
    return {
        "status": "online",
        "app": "TaskMaster Pro API",
        "docs": "/docs",
        "version": "1.0.0"
    }


# Mount built frontend static files if available
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    @app.get("/")
    def root():
        return {
            "message": "Welcome to TaskMaster Pro API",
            "docs": "/docs",
            "version": "1.0.0",
            "status": "online"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
