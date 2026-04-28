import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getAuth } from "firebase/auth";
import firebaseApp from "./firebaseConfig";

class FirebaseService {
  static getStorage() {
    return getStorage(firebaseApp);
  }

  static getAuth() {
    return getAuth(firebaseApp);
  }

  static async upload(file: File, filename: string): Promise<string> {
    const storage = this.getStorage();
    const storageRef = ref(storage, `files/${filename}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  static async delete(url: string): Promise<void> {
    const storage = this.getStorage();
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  }

  static async getFile(url: string): Promise<string | null> {
    try {
      const storage = this.getStorage();
      const storageRef = ref(storage, url);
      return await getDownloadURL(storageRef);
    } catch {
      return null;
    }
  }
}

export default FirebaseService;
