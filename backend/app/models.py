from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, Float

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    UserId = Column(String, primary_key=True)
    Name = Column(String, nullable=False)
    Email = Column(String, unique=True, nullable=False)
    Role = Column(String, nullable=False)  # could use Enum if fixed roles
    Password = Column(String, nullable=False)
    CreatedAt = Column(DateTime, nullable=False)
    UpdatedAt = Column(DateTime, nullable=False)

    visitor = relationship("Visitor", uselist=False, back_populates="user")
    admin = relationship("Administrator", uselist=False, back_populates="user")
    operator = relationship("Operator", uselist=False, back_populates="user")


class Visitor(Base):
    __tablename__ = "visitors"

    UserId = Column(String, ForeignKey("users.UserId"), primary_key=True)

    user = relationship("User", back_populates="visitor")
    favorites = relationship("FavoriteInstitution", back_populates="visitor")
    logs = relationship("VisitorLog", back_populates="visitor")
    alert_preferences = relationship("AlertPreference", back_populates="visitor")
    wait_predictions = relationship("WaitTimePrediction", back_populates="visitor")


class Administrator(Base):
    __tablename__ = "administrators"

    UserId = Column(String, ForeignKey("users.UserId"), primary_key=True)

    user = relationship("User", back_populates="admin")
    institutions = relationship("Institution", back_populates="administrator")


class Operator(Base):
    __tablename__ = "operators"

    UserId = Column(String, ForeignKey("users.UserId"), primary_key=True)
    BranchId = Column(String, ForeignKey("branches.BranchId"), primary_key=True)

    user = relationship("User", back_populates="operator")
    branch = relationship("Branch", back_populates="operators")


class InstitutionType(Base):
    __tablename__ = "institution_types"

    InstitutionTypeId = Column(String, primary_key=True)
    InstitutionType = Column(String, nullable=False)

    institutions = relationship("Institution", back_populates="institution_type")


class Institution(Base):
    __tablename__ = "institutions"

    InstitutionId = Column(String, primary_key=True)
    InstitutionTypeId = Column(
        String, ForeignKey("institution_types.InstitutionTypeId")
    )
    AdministratorId = Column(String, ForeignKey("administrators.UserId"))
    Name = Column(String, nullable=False)

    institution_type = relationship("InstitutionType", back_populates="institutions")
    administrator = relationship("Administrator", back_populates="institutions")
    branches = relationship("Branch", back_populates="institution")


class Branch(Base):
    __tablename__ = "branches"

    BranchId = Column(String, primary_key=True)
    InstitutionId = Column(String, ForeignKey("institutions.InstitutionId"))
    Name = Column(String, nullable=False)
    Address = Column(String)
    ServiceHours = Column(String)
    ServiceDescription = Column(String)
    Latitude = Column(Float)
    Longitude = Column(Float)

    institution = relationship("Institution", back_populates="branches")
    operators = relationship("Operator", back_populates="branch")
    favorites = relationship("FavoriteInstitution", back_populates="branch")
    logs = relationship("VisitorLog", back_populates="branch")
    alert_preferences = relationship("AlertPreference", back_populates="branch")
    crowd_data = relationship("CrowdData", back_populates="branch")
    wait_predictions = relationship("WaitTimePrediction", back_populates="branch")


class FavoriteInstitution(Base):
    __tablename__ = "favorite_institutions"

    FavoriteInstitutionId = Column(String, primary_key=True)
    VisitorId = Column(String, ForeignKey("visitors.UserId"))
    BranchId = Column(String, ForeignKey("branches.BranchId"))
    CreatedAt = Column(DateTime)

    visitor = relationship("Visitor", back_populates="favorites")
    branch = relationship("Branch", back_populates="favorites")


class VisitorLog(Base):
    __tablename__ = "visitor_logs"

    VisitorLogId = Column(String, primary_key=True)
    VisitorId = Column(String, ForeignKey("visitors.UserId"))
    BranchId = Column(String, ForeignKey("branches.BranchId"))
    CheckInTime = Column(DateTime)
    ServiceStartTime = Column(DateTime)
    WaitTimeInMinutes = Column(Integer)

    visitor = relationship("Visitor", back_populates="logs")
    branch = relationship("Branch", back_populates="logs")


class AlertPreference(Base):
    __tablename__ = "alert_preferences"

    AlertId = Column(String, primary_key=True)
    VisitorId = Column(String, ForeignKey("visitors.UserId"))
    BranchId = Column(String, ForeignKey("branches.BranchId"))
    CrowdThreshold = Column(Integer)
    CreatedAt = Column(DateTime)

    visitor = relationship("Visitor", back_populates="alert_preferences")
    branch = relationship("Branch", back_populates="alert_preferences")


class CrowdData(Base):
    __tablename__ = "crowd_data"

    CrowdDataId = Column(String, primary_key=True)
    BranchId = Column(String, ForeignKey("branches.BranchId"))
    Timestamp = Column(DateTime)
    CurrentCrowdCount = Column(Integer)

    branch = relationship("Branch", back_populates="crowd_data")


class WaitTimePrediction(Base):
    __tablename__ = "wait_time_predictions"

    WaitTimePredictionId = Column(String, primary_key=True)
    VisitorId = Column(String, ForeignKey("visitors.UserId"))
    BranchId = Column(String, ForeignKey("branches.BranchId"))
    VisitDate = Column(DateTime)
    Accuracy = Column(Float)
    PredictedAt = Column(DateTime)
    ActualWaitTime = Column(Float)
    PredictedWaitTime = Column(Float)

    visitor = relationship("Visitor", back_populates="wait_predictions")
    branch = relationship("Branch", back_populates="wait_predictions")
