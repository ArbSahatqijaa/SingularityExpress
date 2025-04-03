import java.util.Iterator;
import java.util.Vector;


public class Hipodromi {
    public String emri;
    Vector<KafshaGaruese> lista;
    
    public Hipodromi(String e){
        emri = e;
        lista = new Vector<KafshaGaruese>();
    }
    
    public void shtoKafshen(KafshaGaruese kg) throws Exception{
        if(lista.contains(kg)){
            throw new Exception ("Ekziston");
        }
        lista.add(kg);
    }
    
    public void shtyp(){
        Iterator itr = lista.iterator();
        while(itr.hasNext()){
            System.out.println(itr.next());
        }
    }
    
    public void filloGaren() throws Exception{
        Iterator itr = lista.iterator();
        while(itr.hasNext()){
            KafshaGaruese kg = (KafshaGaruese)itr.next();
            if(kg instanceof KaliGarues){
                kg.setPriority(Thread.MAX_PRIORITY);
            }
            kg.start();
        }
    }
    
    public static void main(String[]args){
        Hipodromi h = null;
        try{
          h = new Hipodromi("Stadiumi 1");
          QeniGarues q1 = new QeniGarues(5,"Kita", 0);
          QeniGarues q2 = new QeniGarues(6,"Tika", 0);
          QeniGarues k1 = new QeniGarues(5,"Kangalli", 0);
          QeniGarues k2 = new QeniGarues(7,"Reksi", 0);
         h.shtoKafshen(q1);
         h.shtoKafshen(q2);
         h.shtoKafshen(k1);
         h.shtoKafshen(k2);
        
         h.filloGaren();
        }
        catch(Exception e){
            
        }
    }
}
