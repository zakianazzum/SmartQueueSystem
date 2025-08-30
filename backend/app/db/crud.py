from datetime import datetime
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from app.models import Base

ModelType = TypeVar("ModelType", bound=Base)  # type: ignore
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, *, model: Type[ModelType]):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).
        **Parameters**
        * `model`: A SQLAlchemy model class
        * `schema`: A Pydantic model (schema) class
        """
        self.model = model

    def get(self, db: Session, id: str) -> Optional[ModelType]:
        return db.get(self.model, id)

    def get_by_field(self, db: Session, field: str, value: Any) -> Optional[ModelType]:
        return db.query(self.model).filter(getattr(self.model, field) == value).first()

    def get_by_multiple_fields(
        self, db: Session, fields: Dict[str, Any]
    ) -> Optional[ModelType]:
        query = db.query(self.model)
        for field, value in fields.items():
            query = query.filter(getattr(self.model, field) == value)
        return query.first()

    def get_multi_by_field(
        self, db: Session, field: str, value: Any
    ) -> Optional[ModelType]:
        return db.query(self.model).filter(getattr(self.model, field) == value).all()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)  # type: ignore
        db_obj.updated_at = datetime.now()
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        db_obj = db.get(self.model, obj_in.id)
        if hasattr(obj_in, "updated_at"):
            obj_in.updated_at = datetime.now()

        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = jsonable_encoder(obj_in)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> ModelType:
        obj = db.get(self.model, id)
        if obj is None:
            raise CustomException(ResourceNotFound)
        db.delete(obj)
        db.commit()
        return obj
