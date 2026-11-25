import Map "mo:core/Map";
import CertificationsLib "../lib/certifications";
import Facts "../types/facts";

mixin (factCertifications : Map.Map<Text, Facts.FactCertification>) {
  public query func getCertifications() : async [Text] {
    CertificationsLib.getAll(factCertifications);
  };

  public func addCertification(name : Text, sortOrder : Nat) : async Bool {
    CertificationsLib.add(factCertifications, name, sortOrder);
  };

  public func updateCertification(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    CertificationsLib.update(factCertifications, oldName, newName, sortOrder);
  };

  public func deleteCertification(name : Text) : async Bool {
    CertificationsLib.delete(factCertifications, name);
  };
};
