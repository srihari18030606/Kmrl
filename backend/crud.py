from sqlalchemy.orm import Session
import models

def get_trains(db: Session):
    return db.query(models.Train).all()

def create_train(db: Session, train):
    existing_train = db.query(models.Train).filter(models.Train.name == train.name).first()
    
    if existing_train:
        return existing_train  # Skip duplicate

    db_train = models.Train(**train.dict())
    db.add(db_train)
    db.commit()
    db.refresh(db_train)
    return db_train

def delete_all_trains(db: Session):
    db.query(models.Train).delete()
    db.commit()