from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS ayarı
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Görevleri listele
@app.get("/tasks")
def get_tasks(db: Session = Depends(get_db)):
    return db.query(models.Task).all()

# Görev ekle
@app.post("/tasks")
def add_task(task: dict, db: Session = Depends(get_db)):
    new_task = models.Task(title=task["title"], completed=False)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

# Görev sil
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı")
    db.delete(task)
    db.commit()
    return {"message": "Görev silindi"}

# Görev güncelle (tamamlama veya başlık değiştirme)
@app.put("/tasks/{task_id}")
def update_task(task_id: int, updated_task: dict, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı")
    
    # Gelen veriye göre alanları güncelle
    if "title" in updated_task:
        task.title = updated_task["title"]
    if "completed" in updated_task:
        task.completed = updated_task["completed"]

    db.commit()
    db.refresh(task)
    return task